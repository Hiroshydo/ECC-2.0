# Ecclesia Finance Web

Aplicação Next.js com banco SQLite local para uso em uma única instância no Windows.

## Executar localmente

Requisitos: Node.js com suporte a `node:sqlite` e npm.

```powershell
npm --prefix web ci
npm --prefix web run dev
```

O banco é criado automaticamente em `%LOCALAPPDATA%\ECC-2.0\ecclesia.sqlite`. Para usar outro caminho, defina `ECC_SQLITE_PATH` em `web/.env.local`; caminhos relativos são resolvidos a partir de `web`.

O endpoint `/api/health` informa se a aplicação está conectada ao SQLite.

## Importar o backup PostgreSQL

O importador lê apenas as tabelas de aplicação selecionadas e os dados de usuários/identidades. Ele não executa o dump PostgreSQL. Informe o caminho do arquivo SQL:

```powershell
cd web
node scripts/import-supabase-dump.mjs "C:\caminho\backup_completo.sql"
```

Por padrão, a importação cria `%LOCALAPPDATA%\ECC-2.0\ecclesia.sqlite` e se recusa a sobrescrever uma base existente. Faça a importação antes de iniciar a aplicação pela primeira vez. Senhas são mantidas somente como hashes; um administrador mestre pode redefinir contas com hashes incompatíveis pela tela de usuários. A senha temporária é exibida uma única vez e deve ser compartilhada por um canal seguro.

## Verificações

Na raiz do repositório:

```powershell
npm --prefix web run lint
npm --prefix web run build
```

SQLite local destina-se a uma instância no mesmo computador. Não use esta configuração em hospedagem serverless ou com múltiplas instâncias concorrentes.

As migrations e configurações em `web/supabase` são referências legadas do esquema PostgreSQL; não são necessárias para executar a aplicação SQLite.
