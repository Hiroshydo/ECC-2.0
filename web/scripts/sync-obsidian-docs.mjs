import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(scriptDir, "..");
const repoDir = path.resolve(webDir, "..");

const routesDir = path.join(webDir, "src", "app", "(authenticated)");
const migrationsDir = path.join(webDir, "supabase", "migrations");
const modulesDir = path.join(webDir, "src", "modules");
const brandingDir = path.join(webDir, "public", "branding");
const docsAssetsDir = path.join(repoDir, "docs", "assets", "branding");

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) return 0;
  fs.mkdirSync(target, { recursive: true });
  let copied = 0;
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copied += copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
      copied += 1;
    }
  }
  return copied;
}

const copiedBrandingFiles = copyDirectory(brandingDir, docsAssetsDir);

function walk(directory, extension) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute, extension);
    return entry.isFile() && entry.name.endsWith(extension) ? [absolute] : [];
  });
}

function relative(file) {
  return path.relative(repoDir, file).replaceAll("\\", "/");
}

const routeFiles = walk(routesDir, ".tsx")
  .filter((file) => file.endsWith("page.tsx"))
  .map(relative)
  .sort();

const migrations = fs.existsSync(migrationsDir)
  ? fs.readdirSync(migrationsDir).filter((file) => /\.sql$/i.test(file)).sort()
  : [];

const moduleFiles = walk(modulesDir, ".md")
  .map(relative)
  .sort();

const block = [
  "<!-- AUTO-SYNC:START -->",
  "## Estrutura sincronizada automaticamente",
  "",
  "> Gerado por `npm run docs:sync`. Não edite manualmente o conteúdo entre os marcadores.",
  "",
  "### Rotas protegidas",
  "",
  ...routeFiles.map((file) => `- [${file}](${file})`),
  "",
  "### Migrations",
  "",
  ...migrations.map((file) => `- \`web/supabase/migrations/${file}\``),
  "",
  "### Módulos",
  "",
  ...moduleFiles.map((file) => `- [${file}](${file})`),
  "",
  "<!-- AUTO-SYNC:END -->",
].join("\n");

for (const target of [
  path.join(repoDir, "docs", "00 - Visao Geral ECC.md"),
  path.join(repoDir, "RELATORIO_TECNICO_PROJETO.md"),
]) {
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, `${block}\n`, "utf8");
    continue;
  }
  const content = fs.readFileSync(target, "utf8");
  const pattern = /<!-- AUTO-SYNC:START -->[\s\S]*?<!-- AUTO-SYNC:END -->/;
  if (pattern.test(content)) {
    fs.writeFileSync(target, content.replace(pattern, block), "utf8");
  } else {
    fs.writeFileSync(target, `${content.trimEnd()}\n\n${block}\n`, "utf8");
  }
}

console.log(`Sincronização Obsidian concluída: ${routeFiles.length} rotas, ${migrations.length} migrations, ${moduleFiles.length} README de módulos, ${copiedBrandingFiles} arquivos de branding.`);
