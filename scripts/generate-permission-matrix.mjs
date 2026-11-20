import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const accessPath = path.join(root, "web", "src", "domain", "access.ts");
const migrationPath = path.join(root, "web", "supabase", "migrations");
const outputPath = path.join(root, "docs", "auditoria-atual", "matriz-permissoes.md");

function requireMatch(source, pattern, description) {
  const match = source.match(pattern);
  if (!match) throw new Error(`Could not parse ${description}`);
  return match[1];
}

function parseCodeMatrix(source) {
  const roles = [...requireMatch(source, /export type Role\s*=\s*([\s\S]*?);/, "Role")
    .matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  const permissions = [...requireMatch(source, /export type Permission\s*=\s*([\s\S]*?);/, "Permission")
    .matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  const roleBlock = requireMatch(source, /export const rolePermissions[^=]*=\s*\{([\s\S]*?)\n\};/, "rolePermissions");
  const rolePermissions = new Map();
  for (const match of roleBlock.matchAll(/^\s*([a-z_]+):\s*\[([^\]]*)\]/gm)) {
    rolePermissions.set(match[1], new Set([...match[2].matchAll(/"([^"]+)"/g)].map((item) => item[1])));
  }
  for (const role of roles) {
    if (!rolePermissions.has(role)) throw new Error(`Missing rolePermissions entry for ${role}`);
  }
  return { roles, permissions, rolePermissions };
}

async function loadMigrations() {
  const files = (await readdir(migrationPath)).filter((file) => file.endsWith(".sql")).sort();
  if (!files.length) throw new Error("No SQL migrations found");
  return Promise.all(files.map(async (file) => ({
    file,
    source: await readFile(path.join(migrationPath, file), "utf8"),
  })));
}

function parseDatabasePermissionMatrix(migrations, permissions, roles) {
  let latestPermissionFunction = "";
  const allSources = [];
  const functions = new Map();
  const policies = [];

  for (const migration of migrations) {
    allSources.push(migration);
    for (const match of migration.source.matchAll(/create(?:\s+or\s+replace)?\s+function\s+public\.([a-z_]+)\s*\(/gi)) {
      const start = match.index;
      const next = migration.source.slice(start + match[0].length).search(/create(?:\s+or\s+replace)?\s+function\s+public\.[a-z_]+\s*\(/i);
      const body = migration.source.slice(start, next < 0 ? undefined : start + match[0].length + next);
      functions.set(match[1], { file: migration.file, body });
      if (match[1] === "has_congregation_permission") latestPermissionFunction = body;
    }
    for (const match of migration.source.matchAll(/create\s+policy\s+"([^"]+)"[\s\S]*?;/gi)) {
      policies.push({ file: migration.file, name: match[1], body: match[0] });
    }
  }

  if (!latestPermissionFunction) throw new Error("Database permission helper not found");
  const defaults = new Map(permissions.map((permission) => [permission, new Set()]));
  const permissionCaseBlocks = [...latestPermissionFunction.matchAll(
    /return\s+case\s+target_permission([\s\S]*?)\bend\s*;/gi,
  )];
  if (!permissionCaseBlocks.length) throw new Error("Could not parse database permission cases");
  const permissionCases = permissionCaseBlocks.at(-1)[1];
  for (const match of permissionCases.matchAll(/when\s+'([^']+)'\s+then\s+([^;\n]+)/gi)) {
    const [, permission, expression] = match;
    if (!defaults.has(permission)) defaults.set(permission, new Set());
    if (/^\s*true\s*$/i.test(expression)) {
      roles.forEach((role) => defaults.get(permission).add(role));
      continue;
    }
    const allowedRoles = expression.match(/actor_role\s+in\s*\(([^)]*)\)/i)?.[1];
    if (allowedRoles) {
      for (const roleMatch of allowedRoles.matchAll(/'([^']+)'/g)) {
        if (roles.includes(roleMatch[1])) defaults.get(permission).add(roleMatch[1]);
      }
    }
  }

  const permissionEvidence = new Map();
  for (const permission of permissions) {
    const rpcs = [];
    for (const [name, definition] of functions) {
      if (
        (definition.body.includes("has_congregation_permission(") || definition.body.includes("has_congregation_role("))
        && definition.body.includes(`'${permission}'`)
      ) rpcs.push(name);
    }
    const relatedPolicies = policies
      .filter((policy) => policy.body.includes(`'${permission}'`))
      .map((policy) => policy.name);
    const files = allSources
      .filter((migration) => migration.source.includes(`'${permission}'`))
      .map((migration) => migration.file);
    permissionEvidence.set(permission, {
      rpcs: [...new Set(rpcs)].sort(),
      policies: [...new Set(relatedPolicies)].sort(),
      files: [...new Set(files)].sort(),
    });
  }

  return { defaults, permissionEvidence, functions, policies };
}

function markdownTable(code, database) {
  const lines = [
    "| Perfil | Operação | Código (`access.ts`) | Banco (padrão) | RPC/política RLS | Divergência |",
    "|---|---|---:|---:|---|---|",
  ];

  for (const role of code.roles) {
    for (const permission of code.permissions) {
      const codeAllows = code.rolePermissions.get(role).has(permission);
      const databaseAllows = database.defaults.get(permission)?.has(role) ?? false;
      const evidence = database.permissionEvidence.get(permission);
      const references = [
        ...(evidence.rpcs.length ? [`RPC: ${evidence.rpcs.join(", ")}`] : []),
        ...(evidence.policies.length ? [`RLS: ${evidence.policies.join(", ")}`] : []),
        ...(!evidence.rpcs.length && !evidence.policies.length && evidence.files.length ? [`SQL: ${evidence.files.join(", ")}`] : []),
      ];
      const discrepancy = codeAllows === databaseAllows ? "—" : "SIM";
      lines.push(`| \`${role}\` | \`${permission}\` | ${codeAllows ? "Permite" : "Nega"} | ${databaseAllows ? "Permite" : "Nega"} | ${references.join("<br>") || "Sem referência explícita"} | ${discrepancy} |`);
    }
  }
  return lines.join("\n");
}

const accessSource = await readFile(accessPath, "utf8");
const code = parseCodeMatrix(accessSource);
const migrations = await loadMigrations();
const database = parseDatabasePermissionMatrix(migrations, code.permissions, code.roles);
const matrix = markdownTable(code, database);
const discrepancies = [];
for (const role of code.roles) {
  for (const permission of code.permissions) {
    const codeAllows = code.rolePermissions.get(role).has(permission);
    const databaseAllows = database.defaults.get(permission)?.has(role) ?? false;
    if (codeAllows !== databaseAllows) discrepancies.push(`\`${role}\` × \`${permission}\`: código ${codeAllows ? "permite" : "nega"}; banco ${databaseAllows ? "permite" : "nega"}.`);
  }
}

const content = [
  "# Matriz de permissões: código × PostgreSQL",
  "",
  `Gerada a partir de \`web/src/domain/access.ts\` e das migrations ${migrations[0].file}–${migrations.at(-1).file}.`,
  "",
  "A coluna do banco representa permissões padrão para memberships sem override. Overrides por unidade são tratados separadamente pelo banco. As referências de RPC/RLS são extraídas das definições SQL; esta análise estática não substitui execução em PostgreSQL.",
  "",
  "## Perfil × operação",
  "",
  matrix,
  "",
  "## Divergências",
  "",
  ...(discrepancies.length ? discrepancies.map((item) => `- ${item}`) : ["- Nenhuma divergência entre permissões padrão foi detectada."]),
  "",
  "## Cobertura SQL",
  "",
  `- RPCs analisadas: ${database.functions.size}.`,
  `- Políticas RLS declaradas nas migrations: ${database.policies.length}.`,
  `- Permissões declaradas no código: ${code.permissions.length}.`,
  "",
].join("\n");

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, content, "utf8");
process.stdout.write(`Wrote ${path.relative(root, outputPath)}\n`);
