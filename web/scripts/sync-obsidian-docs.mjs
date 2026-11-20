import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(scriptDir, "..");
const repoDir = path.resolve(webDir, "..");
const docsDir = path.join(repoDir, "docs");
const modulesSourceDir = path.join(webDir, "src", "modules");
const brandingSourceDir = path.join(webDir, "public", "branding");
const brandingTargetDir = path.join(docsDir, "assets", "branding");
const sourceRoot = path.join(webDir, "src");
const telemetryFile = path.join(docsDir, "02 - Telemetria & Contas Ao Vivo.md");
const flowMapFile = path.join(modulesSourceDir, "core", "canaa", "components", "CongregationFlowMap.tsx");
const noahOpsFile = path.join(webDir, "src", "app", "(authenticated)", "noah-ops", "page.tsx");
let flowMapSource = fs.readFileSync(flowMapFile, "utf8");
let noahOpsSource = fs.readFileSync(noahOpsFile, "utf8");

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
    if (!fs.existsSync(destination) || !fs.readFileSync(file).equals(fs.readFileSync(destination))) {
      fs.copyFileSync(file, destination);
    }
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
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === text) return;
  fs.writeFileSync(file, text, { encoding: "utf8" });
}

function readRuntimeEnvironment() {
  const envFile = path.join(webDir, ".env.local");
  const fileValues = {};
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
      const match = /^\s*([\w.-]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!match || match[1].startsWith("#")) continue;
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      } else {
        value = value.replace(/\s+#.*$/, "");
      }
      fileValues[match[1]] = value;
    }
  }
  return {
    get(name) {
      return process.env[name] || fileValues[name] || "";
    },
  };
}

function safeErrorCode(error) {
  return typeof error?.code === "string" && /^[A-Za-z0-9_-]{1,32}$/.test(error.code)
    ? error.code
    : "query_failed";
}

async function fetchAllRows(queryFactory) {
  const rows = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await queryFactory().range(offset, offset + pageSize - 1);
    if (error) return { rows: null, errorCode: safeErrorCode(error) };
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) return { rows, errorCode: null };
  }
}

async function loadLiveSnapshot() {
  const env = readRuntimeEnvironment();
  const url = env.get("NEXT_PUBLIC_SUPABASE_URL");
  const key =
    env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    env.get("SUPABASE_ANON_KEY") ||
    env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (!url || !key) {
    return {
      status: "offline",
      statusMessage: "Supabase indisponível: URL ou chave de leitura não configurada.",
      updatedAt: new Date().toISOString(),
      units: [],
      licenses: [],
      memberships: [],
      audits: [],
      issues: [],
    };
  }

  try {
    const supabase = createSupabaseClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10000) }),
      },
    });
    const [unitsResult, licenseResult, membershipsResult, auditResult] = await Promise.all([
      fetchAllRows(() => supabase
        .from("congregations")
        .select("id, name, organization_type, organization_level, parent_id, active")
        .order("name")),
      fetchAllRows(() => supabase
        .from("khatam_licenses")
        .select("congregation_id, seats_total, expires_at")
        .order("expires_at")),
      fetchAllRows(() => supabase.from("memberships").select("congregation_id")),
      supabase
        .from("audit_events")
        .select("occurred_at, action, congregation_id")
        .order("occurred_at", { ascending: false })
        .limit(10),
    ]);

    const issues = [];
    if (unitsResult.errorCode) issues.push(`congregations:${unitsResult.errorCode}`);
    if (licenseResult.errorCode) issues.push(`khatam_licenses:${licenseResult.errorCode}`);
    if (membershipsResult.errorCode) issues.push(`memberships:${membershipsResult.errorCode}`);
    if (auditResult.error) issues.push(`audit_events:${safeErrorCode(auditResult.error)}`);

    return {
      status: issues.length ? "partial" : "online",
      statusMessage: issues.length
        ? `Supabase respondeu parcialmente; consultas indisponíveis: ${issues.join(", ")}.`
        : "Snapshot Supabase carregado; em modo watch, a leitura é repetida a cada 15 segundos.",
      updatedAt: new Date().toISOString(),
      units: unitsResult.rows ?? [],
      licenses: licenseResult.rows ?? [],
      memberships: membershipsResult.rows ?? [],
      audits: auditResult.data ?? [],
      issues,
    };
  } catch {
    return {
      status: "offline",
      statusMessage: "Não foi possível consultar o Supabase. Verifique a conectividade e as permissões RLS.",
      updatedAt: new Date().toISOString(),
      units: [],
      licenses: [],
      memberships: [],
      audits: [],
      issues: ["connection_failed"],
    };
  }
}

function markdownCell(value) {
  return String(value ?? "—").replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ").trim() || "—";
}

function renderLiveTelemetry(snapshot) {
  const unitById = new Map(snapshot.units.map((unit) => [unit.id, unit]));
  const seatsByUnit = new Map();
  for (const membership of snapshot.memberships) {
    seatsByUnit.set(membership.congregation_id, (seatsByUnit.get(membership.congregation_id) ?? 0) + 1);
  }
  const levelLabels = {
    national_hq: "Sede nacional",
    state_hq: "Sede estadual",
    sub_hq: "Sub-sede",
    local_congregation: "Unidade local",
  };
  const statusClass = snapshot.status === "online" ? "ecc-status-active" : snapshot.status === "partial" ? "ecc-status-partial" : "ecc-status-planned";
  const statusLabel = snapshot.status === "online" ? "🟢 ONLINE" : snapshot.status === "partial" ? "🟡 PARCIAL" : "🔵 OFFLINE";
  const unitRows = snapshot.units.length
    ? snapshot.units.map((unit) => {
      const parent = unit.parent_id ? unitById.get(unit.parent_id)?.name ?? "Matriz não carregada" : "Unidade Raiz";
      return `| ${markdownCell(unit.name)} | ${unit.organization_type === "ong" ? "ONG" : "Igreja"} | ${markdownCell(levelLabels[unit.organization_level] ?? unit.organization_level)} | ${markdownCell(parent)} | ${unit.active ? "Ativa" : "Inativa"} |`;
    })
    : ["| Sem unidades disponíveis | — | — | — | — |"];
  const licenseRows = snapshot.licenses.length
    ? snapshot.licenses.map((license) => {
      const unit = unitById.get(license.congregation_id);
      const used = seatsByUnit.get(license.congregation_id) ?? 0;
      const total = Math.max(0, Number(license.seats_total) || 0);
      const percent = total ? Math.min(100, Math.round(used / total * 100)) : 0;
      const expiration = new Date(license.expires_at);
      const daysRemaining = Number.isNaN(expiration.getTime()) ? null : Math.ceil((expiration.getTime() - Date.now()) / 86400000);
      const daysLabel = daysRemaining === null ? "Data inválida" : daysRemaining < 0 ? `Vencida há ${Math.abs(daysRemaining)} dia(s)` : `${daysRemaining} dia(s)`;
      return [
        `### ${markdownCell(unit?.name ?? "Unidade sem acesso")}`,
        "",
        `- Validade: **${daysLabel}** (expira em ${Number.isNaN(expiration.getTime()) ? "data inválida" : expiration.toLocaleDateString("pt-BR")})`,
        `- Assentos: **${used}/${total}** operadores`,
        `<progress class="ecc-meter" max="${total || 1}" value="${Math.min(used, total)}"></progress> ${percent}%`,
        "",
      ].join("\n");
    })
    : [snapshot.status === "online"
      ? "Nenhuma licença visível para as credenciais de leitura utilizadas."
      : "Licenças indisponíveis enquanto a conexão/permissão não for restabelecida."];
  const auditRows = snapshot.audits.length
    ? snapshot.audits.map((event) => {
      const unit = event.congregation_id ? unitById.get(event.congregation_id)?.name ?? "Unidade não carregada" : "Plataforma";
      const date = new Date(event.occurred_at);
      return `| ${Number.isNaN(date.getTime()) ? "Data inválida" : date.toLocaleString("pt-BR")} | ${markdownCell(event.action)} | ${markdownCell(unit)} |`;
    })
    : ["| Sem eventos visíveis | — | — |"];

  return [
    "---",
    "title: Telemetria & Contas Ao Vivo",
    "module: ecc-live-telemetry",
    "layer: core",
    "status: dinamico",
    "tags: [ecc, core, telemetry, supabase]",
    "---",
    "",
    "# Telemetria & Contas Ao Vivo",
    "",
    `<span class="ecc-status ${statusClass}">${statusLabel}</span>  Atualizado: ${new Date(snapshot.updatedAt).toLocaleString("pt-BR")}`,
    "",
    `> ${snapshot.statusMessage}`,
    "",
    "## Contas & unidades cadastradas — Hiram",
    "",
    "| Unidade | Natureza | Nível hierárquico | Vínculo de matriz (`parent_id`) | Status |",
    "|---|---|---|---|---|",
    ...unitRows,
    "",
    "## Licenças & cotas — Khatam",
    "",
    ...licenseRows,
    "## Últimos eventos — Enoch Audit",
    "",
    "| Data/hora | Ação | Unidade |",
    "|---|---|---|",
    ...auditRows,
    "",
    "## Precisão do schema",
    "",
    "- A tabela `khatam_licenses` armazena `seats_total` e `expires_at`; `seats_total` é apresentado como limite de assentos (equivalente operacional ao `max_operators`, não nome literal de coluna).",
    "- O schema atual não registra início nem duração do ciclo de 30 dias. A contagem exibida é de dias até `expires_at`; não é possível inferir o ciclo comercial de 30 dias com os campos existentes.",
    "- Os registros de auditoria reais estão em `audit_events` (não `audit_logs`). Por privacidade, esta nota exibe apenas data/hora, ação e unidade; não inclui ator, motivo, payload ou UUIDs.",
    "- Em modo anon/publishable, RLS pode limitar os dados visíveis. Uma consulta vazia não garante que não existam registros.",
    "",
    "> Esta nota é gerada localmente pelo sincronizador. Nenhuma URL/chave/token é gravada no Markdown.",
    "",
  ].join("\n");
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
    `- [02 - Telemetria & Contas Ao Vivo.md](${markdownPath(target, relative(telemetryFile))}) — snapshot Supabase; atualização periódica disponível com \`npm run docs:watch\`.`,
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

  const telemetryNodeId = "live-telemetry";
  nodes.push({
    id: telemetryNodeId,
    type: "file",
    file: "02 - Telemetria & Contas Ao Vivo.md",
    x: 1820,
    y: 850,
    width: 400,
    height: 300,
    color: "5",
  });
  for (const [moduleId, label] of [
    ["noah", "Console / observabilidade"],
    ["khatam", "Licenças e cotas"],
    ["canaa", "Unidades e contas"],
  ]) {
    edges.push({
      id: `telemetry-${moduleId}`,
      fromNode: nodeIds[moduleId],
      fromSide: "right",
      toNode: telemetryNodeId,
      toSide: "left",
      label,
      color: "5",
    });
  }

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

async function synchronize() {
flowMapSource = fs.readFileSync(flowMapFile, "utf8");
noahOpsSource = fs.readFileSync(noahOpsFile, "utf8");
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
const authenticatedPages = listFiles(authenticatedRoot, (file) => /page\.(tsx|ts)$/.test(file))
  .map((file) => {
    const absolute = path.join(repoDir, file);
    return { file, route: routePath(absolute, authenticatedRoot) };
  });
const apiRoutes = listFiles(apiRoot, (file) => /route\.(tsx|ts)$/.test(file));
const migrations = listFiles(migrationsRoot, (file) => /\.sql$/i.test(file));
const moduleSources = listFiles(modulesSourceDir, (file) => /\.(tsx?|md)$/.test(file));

for (const moduleInfo of modules) {
  const file = path.join(docsDir, moduleInfo.note);
  if (!fs.existsSync(file)) {
    const frontmatter = [
      "---",
      `title: ${moduleInfo.label}`,
      `module: ${moduleInfo.id}`,
      `layer: ${moduleInfo.layer}`,
      `status: ${moduleInfo.status.toLowerCase()}`,
      `tags: [ecc, ${moduleInfo.layer}, ${moduleInfo.id}]`,
      "---",
      "",
      `# ${moduleInfo.label}`,
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

const snapshot = await loadLiveSnapshot();
writeText(telemetryFile, renderLiveTelemetry(snapshot));
writeCanvas();

const graphSettings = {
  "collapse-filter": false,
  search: '-path:assets -file:"README" -file:"Canaa Local" -file:"Canaa Access" -file:"Noah Developer"',
  showTags: false,
  showAttachments: false,
  hideUnresolved: false,
  showOrphans: false,
  "collapse-color-groups": false,
  colorGroups: [
    { query: 'path:"00 - Visao Geral ECC"', color: { a: 1, rgb: 0xd9a441 } },
    { query: "tag:#core", color: { a: 1, rgb: 0x20a879 } },
    { query: "tag:#plugin", color: { a: 1, rgb: 0x28b8cf } },
  ],
  "collapse-display": false,
  showArrow: true,
  textFadeMultiplier: 0,
  nodeSizeMultiplier: 0.9,
  lineSizeMultiplier: 0.85,
  "collapse-forces": false,
  centerStrength: 0.42,
  repelStrength: 28,
  linkStrength: 1,
  linkDistance: 220,
  scale: 0.0078125,
  close: false,
};
writeText(path.join(docsDir, ".obsidian", "graph.json"), `${JSON.stringify(graphSettings, null, 2)}\n`);
const appearanceSettings = {
  theme: "obsidian",
  enabledCssSnippets: ["ecc-futuristic"],
};
writeText(path.join(docsDir, ".obsidian", "appearance.json"), `${JSON.stringify(appearanceSettings, null, 2)}\n`);

console.log(`Obsidian sincronizado: ${authenticatedPages.length} rotas, ${apiRoutes.length} APIs, ${migrations.length} migrations, ${moduleSources.length} arquivos de módulo, ${modules.length} módulos Canvas, ${copiedBrandingFiles} assets oficiais.`);
}

const watchMode = process.argv.includes("--watch");
let synchronizationRunning = false;
let synchronizationPending = false;
let syncFailed = false;
async function runSynchronization() {
  if (synchronizationRunning) {
    synchronizationPending = true;
    return;
  }
  synchronizationRunning = true;
  do {
    synchronizationPending = false;
    try {
      await synchronize();
      syncFailed = false;
    } catch (error) {
      syncFailed = true;
      console.error(`Sincronização falhou: ${error instanceof Error ? error.message : "erro inesperado"}`);
    }
  } while (synchronizationPending);
  synchronizationRunning = false;
}

await runSynchronization();
if (watchMode) {
  const watchers = [];
  let recursiveWatcherAvailable = false;
  let debounceTimer;

  const closeWatchers = () => {
    for (const watcher of watchers.splice(0)) watcher.close();
  };
  const scheduleSynchronization = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (!recursiveWatcherAvailable) installWatchers();
      void runSynchronization();
    }, 500);
  };
  function installWatchers() {
    closeWatchers();
    try {
      watchers.push(fs.watch(sourceRoot, { recursive: true }, scheduleSynchronization));
      recursiveWatcherAvailable = true;
    } catch {
      recursiveWatcherAvailable = false;
      const addDirectoryWatchers = (directory) => {
        let entries;
        try {
          entries = fs.readdirSync(directory, { withFileTypes: true });
          watchers.push(fs.watch(directory, scheduleSynchronization));
        } catch {
          return;
        }
        for (const entry of entries) {
          if (entry.isDirectory()) addDirectoryWatchers(path.join(directory, entry.name));
        }
      };
      addDirectoryWatchers(sourceRoot);
    }
  }

  installWatchers();
  const pollingTimer = setInterval(() => void runSynchronization(), 15000);
  console.log("Modo watch ativo: Supabase a cada 15 s e alterações em web/src/ com debounce.");
  const shutdown = () => {
    clearInterval(pollingTimer);
    clearTimeout(debounceTimer);
    closeWatchers();
    process.exit(syncFailed ? 1 : 0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
} else if (syncFailed) {
  process.exitCode = 1;
}
