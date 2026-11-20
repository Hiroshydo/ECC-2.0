import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(scriptDir, "..");
const repoDir = path.resolve(webDir, "..");
const docsDir = path.join(repoDir, "docs");
const modulesSourceDir = path.join(webDir, "src", "modules");
const brandingSourceDir = path.join(webDir, "public", "branding");
const brandingTargetDir = path.join(docsDir, "assets", "branding");

const modules = [
  {
    id: "ecclesia",
    label: "Ecclesia Core",
    note: "modulos/Ecclesia Core.md",
    status: "Parcial",
    layer: "core",
    badges: ["Modulos/2_Badges_Com_Nome_Interno/00-ecclesia-finance-core.svg"],
    routes: ["/entradas", "/despesas", "/repasses", "/caixa", "/ajustes", "/estornos"],
    source: ["src/components/*Manager.tsx", "src/app/api/*", "src/app/actions/finance.ts"],
    data: ["entries", "expenses", "headquarters_transfers", "physical_cash_*", "financial_adjustments", "financial_reversals"],
  },
  {
    id: "khatam",
    label: "Khatam Authenticate",
    note: "modulos/Khatam Authenticate.md",
    status: "Parcial",
    layer: "core",
    badges: ["Modulos/2_Badges_Com_Nome_Interno/01-khatam-authenticate.svg"],
    routes: ["/canaa"],
    source: ["src/modules/core/khatam/services/*", "src/modules/core/khatam/components/*"],
    data: ["khatam_licenses", "memberships"],
  },
  {
    id: "hiram",
    label: "Hiram Architecture",
    note: "modulos/Hiram Architecture.md",
    status: "Ativo",
    layer: "core",
    badges: ["Modulos/2_Badges_Com_Nome_Interno/04-hiram-architecture.svg"],
    routes: ["/", "/canaa", "/admin"],
    source: ["src/domain/vocabulary.ts", "src/components/HierarchicalDashboard.tsx", "supabase/migrations/0012_hierarchical_financial_architecture.sql"],
    data: ["congregations", "memberships", "membership_permission_overrides", "get_hierarchical_financial_metrics"],
  },
  {
    id: "canaa",
    label: "Canaã Access & Local",
    note: "modulos/Canaã Access & Local.md",
    status: "Parcial",
    layer: "core",
    badges: [
      "Modulos/2_Badges_Com_Nome_Interno/08-canaa-access.svg",
      "Modulos/2_Badges_Com_Nome_Interno/09-canaa-local.svg",
    ],
    routes: ["/canaa", "/admin"],
    source: ["src/modules/core/canaa", "src/components/AdminManager.tsx", "src/app/api/admin/*"],
    data: ["congregations", "memberships", "membership_permission_overrides", "admin_create_congregation"],
  },
  {
    id: "elias",
    label: "Elias Temp",
    note: "modulos/Elias Temp.md",
    status: "Ativo",
    layer: "core",
    badges: ["Modulos/2_Badges_Com_Nome_Interno/06-elias-temp.svg"],
    routes: ["/fechamento"],
    source: ["src/components/ClosingManager.tsx", "src/app/api/closing/route.ts"],
    data: ["monthly_closings", "period_reopening_requests", "congregation_monthly_summary", "close_monthly_period"],
  },
  {
    id: "enoch",
    label: "Enoch Audit",
    note: "modulos/Enoch Audit.md",
    status: "Ativo",
    layer: "core",
    badges: ["Modulos/2_Badges_Com_Nome_Interno/05-enoch-audit.svg"],
    routes: ["/auditoria"],
    source: ["src/components/AuditLog.tsx", "src/app/(authenticated)/auditoria/page.tsx"],
    data: ["audit_events"],
  },
  {
    id: "sefer",
    label: "Sefer Reports",
    note: "modulos/Sefer Reports.md",
    status: "Ativo",
    layer: "core",
    badges: ["Modulos/2_Badges_Com_Nome_Interno/07-sefer-reports.svg"],
    routes: ["/relatorios"],
    source: ["src/lib/reports/data.ts", "src/components/ReportSummary.tsx"],
    data: ["congregation_monthly_summary", "entries", "expenses", "audit_events"],
  },
  {
    id: "noah",
    label: "Noah Ops",
    note: "modulos/Noah Ops.md",
    status: "Parcial",
    layer: "core",
    badges: ["Modulos/2_Badges_Com_Nome_Interno/10-noah-developer.svg"],
    routes: ["/noah-ops"],
    source: ["src/app/(authenticated)/noah-ops/page.tsx", "src/modules/core/canaa/components/NoahTelemetryGrid.tsx"],
    data: ["health status estático/unknown"],
  },
  {
    id: "gideon",
    label: "Gideon Security",
    note: "modulos/Gideon Security.md",
    status: "Planejado",
    layer: "plugin",
    badges: ["Modulos/2_Badges_Com_Nome_Interno/02-gideon-security.svg"],
    routes: [],
    source: ["src/modules/plugins/gideon/README.md"],
    data: ["nenhuma integração ativa"],
  },
  {
    id: "shofeet",
    label: "Shofeet Note",
    note: "modulos/Shofeet Note.md",
    status: "Planejado",
    layer: "plugin",
    badges: ["Modulos/2_Badges_Com_Nome_Interno/03-shofeet-note.svg"],
    routes: [],
    source: ["src/modules/plugins/shofeet/README.md"],
    data: ["nenhuma integração ativa"],
  },
];

const flows = [
  ["khatam", "canaa", "Licença e cotas para operadores"],
  ["canaa", "hiram", "Unidades, memberships e hierarquia"],
  ["hiram", "ecclesia", "Contexto multi-tenant e permissões"],
  ["ecclesia", "elias", "Competência e fechamento"],
  ["elias", "enoch", "Operações críticas registradas"],
  ["enoch", "sefer", "Histórico consultável em relatórios"],
  ["ecclesia", "gideon", "Futuro: proteção de borda/Pix/WORM"],
  ["ecclesia", "shofeet", "Futuro: dados fiscais e XML"],
  ["noah", "canaa", "Console Dev Master / governança"],
  ["noah", "sefer", "Observabilidade: estado atual limitado"],
];

function walk(directory, predicate) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute, predicate);
    return entry.isFile() && predicate(absolute) ? [absolute] : [];
  });
}

function relative(file) {
  return path.relative(repoDir, file).replaceAll("\\", "/");
}

function copyBranding(source, target) {
  if (!fs.existsSync(source)) throw new Error(`Diretório de branding não encontrado: ${source}`);
  fs.mkdirSync(target, { recursive: true });
  let count = 0;
  for (const file of walk(source, (item) => /\.(svg|png)$/i.test(item))) {
    const destination = path.join(target, path.relative(source, file));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(file, destination);
    count += 1;
  }
  return count;
}

function listFiles(directory, predicate) {
  return walk(directory, predicate).map(relative).sort();
}

function frontmatterValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim().replace(/^["']|["']$/g, "");
}

function routePath(file, root) {
  const sub = path.relative(root, file).replaceAll("\\", "/");
  const withoutPage = sub.replace(/(^|\/)page\.(tsx|ts)$/, "");
  const route = `/${withoutPage.replace(/\/$/, "")}`;
  return route === "/" ? "/" : route.replace(/\[([^\]]+)\]/g, ":$1");
}

function syncBlock(content, block) {
  const marker = /<!-- AUTO-SYNC:START -->[\s\S]*?<!-- AUTO-SYNC:END -->/;
  if (marker.test(content)) return content.replace(marker, block);
  return `${content.trimEnd()}\n\n${block}\n`;
}

function ensureLayerTag(content) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) return content;
  const metadata = frontmatter[1];
  const layer = metadata.match(/^layer:\s*(core|plugin)\s*$/m)?.[1];
  if (!layer) return content;
  const tagMatch = metadata.match(/^tags:\s*(\[[^\]]*\]|(?:\r?\n(?:[ \t]+-[^\r\n]*\r?\n?)+))/m);
  const tags = tagMatch
    ? [...tagMatch[1].matchAll(/[A-Za-z0-9_-]+/g)].map((match) => match[0]).filter((tag) => tag !== "-")
    : [];
  if (!tags.includes(layer)) tags.push(layer);
  const replacement = `tags: [${[...new Set(tags)].join(", ")}]`;
  const nextMetadata = tagMatch
    ? metadata.replace(tagMatch[0], replacement)
    : `${metadata}\n${replacement}`;
  const nextFrontmatter = `---\n${nextMetadata}\n---`;
  return content.replace(frontmatter[0], nextFrontmatter);
}

function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, { encoding: "utf8" });
}

function markdownPath(target, repoRelativePath) {
  return path.relative(path.dirname(target), path.join(repoDir, repoRelativePath)).replaceAll("\\", "/");
}

function autoBlock({ routes, apiRoutes, migrations, moduleSources }, target) {
  return [
    "<!-- AUTO-SYNC:START -->",
    "## Inventário sincronizado do código",
    "",
    "> Gerado por `npm run docs:sync`. Conteúdo entre estes marcadores não deve ser editado manualmente.",
    "",
    "### Rotas autenticadas",
    "",
    ...routes.map((item) => `- \`${item.route}\` — [${item.file}](${markdownPath(target, item.file)})`),
    "",
    "### APIs",
    "",
    ...apiRoutes.map((file) => `- [${file}](${markdownPath(target, file)})`),
    "",
    "### Migrations",
    "",
    ...migrations.map((file) => `- [${file}](${markdownPath(target, file)})`),
    "",
    "### Código dos módulos",
    "",
    ...moduleSources.map((file) => `- [${file}](${markdownPath(target, file)})`),
    "",
    "### Editor do grafo e console Noah",
    "",
    `- [${relative(flowMapFile)}](${markdownPath(target, relative(flowMapFile))}) — ${flowMapSource.includes("onConnect") ? "conexão React Flow habilitada" : "sem handler onConnect detectado"}; ${flowMapSource.includes("@dagrejs/dagre") ? "layout Dagre" : "layout não automatizado"}.`,
    `- [${relative(noahOpsFile)}](${markdownPath(target, relative(noahOpsFile))}) — ${noahOpsSource.includes("ModuleArchitectureMap") ? "inclui mapa de arquitetura ECC" : "mapa técnico não detectado"}.`,
    "",
    "<!-- AUTO-SYNC:END -->",
  ].join("\n");
}

function writeCanvas() {
  const nodes = [];
  const edges = [];
  const groups = [
    { id: "group-governance", label: "1. Entrada, Identidade e Governança", x: 0, y: 0, width: 1100, height: 330, color: "2" },
    { id: "group-core", label: "2. Núcleo Transacional", x: 0, y: 390, width: 1100, height: 360, color: "4" },
    { id: "group-trust", label: "3. Fechamento, Auditoria e Relatórios", x: 0, y: 820, width: 1100, height: 330, color: "5" },
    { id: "group-plugins", label: "4. Observabilidade e Plug-ins", x: 1220, y: 0, width: 500, height: 1150, color: "6" },
  ];
  for (const group of groups) nodes.push({ type: "group", ...group });

  const positions = {
    khatam: { x: 50, y: 80 },
    canaa: { x: 390, y: 80 },
    hiram: { x: 730, y: 80 },
    ecclesia: { x: 250, y: 485 },
    elias: { x: 50, y: 920 },
    enoch: { x: 390, y: 920 },
    sefer: { x: 730, y: 920 },
    noah: { x: 1320, y: 100 },
    gideon: { x: 1320, y: 430 },
    shofeet: { x: 1320, y: 760 },
  };
  const nodeIds = {};

  for (const [index, module] of modules.entries()) {
    const pos = positions[module.id] ?? {
      x: 1800 + (index % 3) * 340,
      y: 120 + Math.floor(index / 3) * 280,
    };
    const noteNodeId = `module-${module.id}`;
    nodeIds[module.id] = noteNodeId;
    nodes.push({
      id: noteNodeId,
      type: "file",
      file: module.note,
      x: pos.x,
      y: pos.y,
      width: 300,
      height: 220,
      color: module.layer === "plugin" ? "6" : module.id === "hiram" || module.id === "sefer" ? "5" : module.id === "khatam" ? "2" : "4",
    });

    module.badges.forEach((badge, index) => {
      const badgeId = `icon-${module.id}-${index}`;
      nodes.push({
        id: badgeId,
        type: "file",
        file: `assets/branding/${badge}`,
        x: pos.x + 225 + index * 75,
        y: pos.y - 52,
        width: 72,
        height: 72,
      });
      edges.push({
        id: `badge-link-${module.id}-${index}`,
        fromNode: badgeId,
        fromSide: "bottom",
        toNode: noteNodeId,
        toSide: "top",
        label: "Identidade oficial",
      });
    });
  }

  nodes.push({
    id: "ecc-main-logo",
    type: "file",
    file: "assets/branding/ecclesia-finance-logo.png",
    x: 270,
    y: 420,
    width: 260,
    height: 100,
  });
  edges.push({
    id: "ecc-logo-core",
    fromNode: "ecc-main-logo",
    fromSide: "bottom",
    toNode: nodeIds.ecclesia,
    toSide: "top",
    label: "Marca do núcleo",
  });

  flows.forEach(([source, target, label], index) => {
    edges.push({
      id: `flow-${index}-${source}-${target}`,
      fromNode: nodeIds[source],
      fromSide: source === "ecclesia" || source === "elias" || source === "enoch" ? "bottom" : "right",
      toNode: nodeIds[target],
      toSide: target === "elias" || target === "enoch" || target === "sefer" ? "top" : "left",
      label,
      color: modules.find((item) => item.id === target)?.layer === "plugin" ? "6" : undefined,
    });
  });

  writeText(path.join(docsDir, "01 - Arquitetura Viva ECC.canvas"), `${JSON.stringify({ nodes, edges }, null, 2)}\n`);
}

const copiedBrandingFiles = copyBranding(brandingSourceDir, brandingTargetDir);
const badgeFiles = listFiles(brandingSourceDir, (file) =>
  file.endsWith(".svg") && file.includes("2_Badges_Com_Nome_Interno"),
);
const moduleReadmes = walk(modulesSourceDir, (file) => path.basename(file).toLowerCase() === "readme.md");
for (const readme of moduleReadmes) {
  const readmeText = fs.readFileSync(readme, "utf8");
  const moduleId = frontmatterValue(readmeText, "module") ?? path.basename(path.dirname(readme));
  if (modules.some((module) => module.id === moduleId)) continue;
  const label = frontmatterValue(readmeText, "title") ?? moduleId;
  const layer = frontmatterValue(readmeText, "layer") === "plugin" ? "plugin" : "core";
  const statusValue = frontmatterValue(readmeText, "status") ?? "parcialmente implementado";
  const normalizedStatus = /planejad|adiad/i.test(statusValue) ? "Planejado" : /parcial|integr/i.test(statusValue) ? "Parcial" : "Ativo";
  const matchingBadges = badgeFiles.filter((file) => path.basename(file).toLowerCase().includes(moduleId.toLowerCase()));
  modules.push({
    id: moduleId,
    label,
    note: `modulos/${label}.md`,
    status: normalizedStatus,
    layer,
    badges: matchingBadges.map((file) => path.relative(brandingSourceDir, path.join(repoDir, file)).replaceAll("\\", "/")),
    routes: [],
    source: [relative(readme)],
    data: [],
  });
}
const authenticatedRoot = path.join(webDir, "src", "app", "(authenticated)");
const apiRoot = path.join(webDir, "src", "app", "api");
const migrationsRoot = path.join(webDir, "supabase", "migrations");
const flowMapFile = path.join(modulesSourceDir, "core", "canaa", "components", "CongregationFlowMap.tsx");
const noahOpsFile = path.join(authenticatedRoot, "noah-ops", "page.tsx");
const flowMapSource = fs.readFileSync(flowMapFile, "utf8");
const noahOpsSource = fs.readFileSync(noahOpsFile, "utf8");
const authenticatedPages = listFiles(authenticatedRoot, (file) => /page\.(tsx|ts)$/.test(file))
  .map((file) => {
    const absolute = path.join(repoDir, file);
    return { file, route: routePath(absolute, authenticatedRoot) };
  });
const apiRoutes = listFiles(apiRoot, (file) => /route\.(tsx|ts)$/.test(file));
const migrations = listFiles(migrationsRoot, (file) => /\.sql$/i.test(file));
const moduleSources = listFiles(modulesSourceDir, (file) => /\.(tsx?|md)$/.test(file));

for (const module of modules) {
  const file = path.join(docsDir, module.note);
  if (!fs.existsSync(file)) {
    const frontmatter = [
      "---",
      `title: ${module.label}`,
      `module: ${module.id}`,
      `layer: ${module.layer}`,
      `status: ${module.status.toLowerCase()}`,
      `tags: [ecc, ${module.layer}, ${module.id}]`,
      "---",
      "",
      `# ${module.label}`,
      "",
    ].join("\n");
    writeText(file, frontmatter);
  }
}

const inventory = { routes: authenticatedPages, apiRoutes, migrations, moduleSources };
const markdownTargets = [
  path.join(docsDir, "00 - Visao Geral ECC.md"),
  path.join(repoDir, "RELATORIO_TECNICO_PROJETO.md"),
  ...walk(path.join(docsDir, "modulos"), (file) => file.endsWith(".md")),
];

for (const target of markdownTargets) {
  if (!fs.existsSync(target)) continue;
  const content = ensureLayerTag(fs.readFileSync(target, "utf8"));
  writeText(target, syncBlock(content, autoBlock(inventory, target)));
}

writeCanvas();

const graphSettings = {
  "collapse-filter": false,
  search: "path:docs -path:docs/assets",
  showTags: false,
  showAttachments: false,
  hideUnresolved: false,
  showOrphans: true,
  "collapse-color-groups": false,
  colorGroups: [
    { query: 'path:"00 - Visao Geral ECC"', color: { a: 1, rgb: 0xd9a441 } },
    { query: "tag:#core", color: { a: 1, rgb: 0x20a879 } },
    { query: "tag:#plugin", color: { a: 1, rgb: 0x28b8cf } },
  ],
  "collapse-display": false,
  showArrow: true,
  textFadeMultiplier: 0,
  nodeSizeMultiplier: 1,
  lineSizeMultiplier: 1,
  "collapse-forces": false,
  centerStrength: 0.518713248970312,
  repelStrength: 15,
  linkStrength: 1,
  linkDistance: 220,
  scale: 0.0078125,
  close: false,
};
writeText(path.join(docsDir, ".obsidian", "graph.json"), `${JSON.stringify(graphSettings, null, 2)}\n`);

console.log(`Obsidian sincronizado: ${authenticatedPages.length} rotas, ${apiRoutes.length} APIs, ${migrations.length} migrations, ${moduleSources.length} arquivos de módulo, ${modules.length} módulos Canvas, ${copiedBrandingFiles} assets oficiais.`);
