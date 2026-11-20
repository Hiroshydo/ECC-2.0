# Runbook de restauração de backup em homologação

Este procedimento restaura um backup PostgreSQL em um destino descartável de homologação. Não configura o provedor, não usa credenciais versionadas e não deve ser executado contra produção.

## Pré-requisitos

- Um arquivo de backup obtido pelo processo de backup já aprovado.
- Um banco PostgreSQL vazio e isolado de homologação, compatível com a versão e as extensões da origem.
- `pg_restore` e `psql` instalados na máquina de operação.
- As variáveis `BACKUP_FILE` e `PG_HOMOLOG_DATABASE_URL` fornecidas pelo ambiente seguro de execução. Não grave seus valores em arquivos, histórico de shell, logs ou tickets.
- Autorização para restaurar no destino de homologação.

Não reutilize uma base compartilhada sem autorização: a restauração pode sobrescrever dados. Este runbook não inclui criação, exclusão ou configuração de recursos no provedor.

## Preparar e validar o arquivo

No PowerShell:

```powershell
if (-not (Test-Path -LiteralPath $env:BACKUP_FILE -PathType Leaf)) {
  throw "Arquivo de backup não encontrado."
}

$backupInfo = Get-Item -LiteralPath $env:BACKUP_FILE
$backupHash = Get-FileHash -LiteralPath $env:BACKUP_FILE -Algorithm SHA256
$backupInfo | Select-Object Name, Length, LastWriteTime
$backupHash | Select-Object Algorithm, Hash
```

Registre o nome, tamanho, horário e hash SHA-256 no registro de execução, sem copiar URLs ou credenciais. Para um arquivo em formato custom do PostgreSQL, confira se o catálogo pode ser lido:

```powershell
pg_restore --list "$env:BACKUP_FILE" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "O catálogo do backup não pôde ser lido." }
```

Se o arquivo for SQL plain-text, não use `pg_restore`; use a variante `psql` abaixo. Confirme o formato pela documentação do processo que produziu o backup, sem despejar o conteúdo em logs.

## Restaurar e medir o tempo

Use um banco vazio de homologação. Não passe `--clean` para reaproveitar um destino sem um procedimento de limpeza aprovado.

### Backup custom (`pg_dump -Fc`)

```powershell
$restoreStartedAt = Get-Date
pg_restore --exit-on-error --no-owner --no-acl --dbname="$env:PG_HOMOLOG_DATABASE_URL" "$env:BACKUP_FILE"
$restoreExitCode = $LASTEXITCODE
$restoreElapsed = (Get-Date) - $restoreStartedAt
if ($restoreExitCode -ne 0) { throw "A restauração falhou; código $restoreExitCode." }
$restoreElapsed | Select-Object TotalSeconds
```

### Backup SQL plain-text

```powershell
$restoreStartedAt = Get-Date
psql --no-psqlrc --set ON_ERROR_STOP=1 --dbname="$env:PG_HOMOLOG_DATABASE_URL" --file="$env:BACKUP_FILE"
$restoreExitCode = $LASTEXITCODE
$restoreElapsed = (Get-Date) - $restoreStartedAt
if ($restoreExitCode -ne 0) { throw "A restauração falhou; código $restoreExitCode." }
$restoreElapsed | Select-Object TotalSeconds
```

Para medir o tempo de recuperação operacional completo, registre também os horários de início do preparo do destino e do fim das verificações. Relate separadamente: transferência do arquivo, restauração e validação. Não inclua o valor da URL de conexão no relatório.

## Verificações após a restauração

1. Confirme que o processo terminou com código zero e registre a versão do PostgreSQL e o hash do backup usado.
2. Confira se as migrations esperadas foram restauradas e se o schema contém as tabelas centrais:

   ```sql
   SELECT to_regclass('public.congregations') AS congregations,
          to_regclass('public.memberships') AS memberships,
          to_regclass('public.entries') AS entries,
          to_regclass('public.headquarters_transfers') AS headquarters_transfers,
          to_regclass('public.audit_events') AS audit_events;
   ```

3. Compare contagens e períodos de `congregations`, `memberships`, `entries`, `expenses`, `headquarters_transfers`, `monthly_closings` e `audit_events` com o inventário aprovado da origem. Registre diferenças explicadas; não altere os dados para forçar igualdade.
4. Verifique integridade referencial e objetos inválidos:

   ```sql
   SELECT conrelid::regclass AS table_name, conname
   FROM pg_constraint
   WHERE contype = 'f' AND NOT convalidated;

   SELECT n.nspname, c.relname
   FROM pg_class c
   JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE c.relkind IN ('v', 'm') AND n.nspname = 'public' AND c.relispopulated = false;
   ```

5. Confirme que políticas RLS continuam habilitadas nas tabelas sensíveis (`auth.users`, memberships, dados financeiros e auditoria). Valide leitura com usuários de homologação de escopos distintos; uma sede não deve enxergar a outra.
6. Rode os testes de RLS em uma cópia descartável isolada, conforme [database-tests/README.md](../../database-tests/README.md). A suíte cria fixtures e confirma transações; não a execute em produção nem em uma homologação compartilhada com dados que precisem ser preservados.
7. Faça um smoke test da aplicação em homologação: autenticação com uma conta de teste autorizada, leitura de uma unidade, consulta financeira e verificação do health check. Confirme que não houve exposição de dados entre unidades e revise os logs por erros de banco ou de aplicação.
8. Registre resultado, duração total, duração da restauração, diferenças encontradas e responsável pela validação. Não anexe dados pessoais, tokens ou URLs de conexão.

Se uma etapa falhar, não direcione usuários para a base restaurada. Preserve o log sanitizado e o hash do arquivo; descarte ou mantenha o destino conforme o procedimento aprovado de homologação. A recuperação da produção e a configuração do provedor não fazem parte deste runbook.
