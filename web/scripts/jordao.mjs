import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(projectDirectory, ".env.local");
const [action, profile, ...extraArguments] = process.argv.slice(2);

if (action !== "use" || profile !== "local" || extraArguments.length > 0) {
  console.error("Uso: npm run jordao -- use local");
  process.exit(1);
}

function parseEnvironment(output) {
  return Object.fromEntries(
    output.split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) return [];
      const [, name, rawValue] = match;
      const value = rawValue.startsWith('"') ? JSON.parse(rawValue) : rawValue;
      return [[name, value]];
    }),
  );
}

let supabaseEnvironment;
try {
  const output = execFileSync("npx", ["supabase", "status", "-o", "env"], {
    cwd: projectDirectory,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  supabaseEnvironment = parseEnvironment(output);
} catch (error) {
  console.error("Supabase local indisponível. Inicie os serviços com `npm run local:up`.");
  console.error(error.message);
  process.exit(1);
}

const apiUrl = supabaseEnvironment.API_URL;
const databaseUrl = supabaseEnvironment.DB_URL;
if (
  !/^http:\/\/(127\.0\.0\.1|localhost):54321$/.test(apiUrl ?? "")
  || !/^postgres(?:ql)?:\/\/.+@(127\.0\.0\.1|localhost):54322\/postgres(?:\?.*)?$/.test(databaseUrl ?? "")
) {
  console.error("A configuração retornada não corresponde ao Supabase local esperado.");
  process.exit(1);
}

const publishableKey = supabaseEnvironment.PUBLISHABLE_KEY ?? supabaseEnvironment.ANON_KEY;
const serviceRoleKey = supabaseEnvironment.SERVICE_ROLE_KEY ?? supabaseEnvironment.SECRET_KEY;
if (!publishableKey || !serviceRoleKey) {
  console.error("O Supabase local não retornou as chaves necessárias para o app.");
  process.exit(1);
}

let existingContent = "";
try {
  existingContent = readFileSync(envPath, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const existingSessionSecret = existingContent.match(/^SESSION_SECRET=(.*)$/m)?.[1];
const sessionSecret = existingSessionSecret
  ? existingSessionSecret.startsWith('"')
    ? JSON.parse(existingSessionSecret)
    : existingSessionSecret
  : randomBytes(48).toString("base64url");
if (sessionSecret.length < 32) {
  console.error("SESSION_SECRET existente deve ter pelo menos 32 caracteres.");
  process.exit(1);
}
const managedValues = new Map([
  ["NEXT_PUBLIC_SUPABASE_URL", apiUrl],
  ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", publishableKey],
  ["SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey],
  ["DATABASE_URL", databaseUrl],
  ["DATABASE_ADMIN_URL", databaseUrl],
  ["SESSION_SECRET", sessionSecret],
]);
const writtenNames = new Set();
const lines = existingContent.split(/\r?\n/).flatMap((line) => {
  const name = line.match(/^([A-Z0-9_]+)=/)?.[1];
  if (!name || !managedValues.has(name)) return [line];
  if (writtenNames.has(name)) return [];
  writtenNames.add(name);
  return [`${name}=${JSON.stringify(managedValues.get(name))}`];
});

for (const [name, value] of managedValues) {
  if (!writtenNames.has(name)) lines.push(`${name}=${JSON.stringify(value)}`);
}

writeFileSync(envPath, `${lines.filter((line, index) => line || index < lines.length - 1).join("\n")}\n`, {
  mode: 0o600,
});
chmodSync(envPath, 0o600);
console.log("Perfil local configurado em web/.env.local. Chaves e segredos não foram exibidos.");
