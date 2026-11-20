"use client";

import "@xyflow/react/dist/style.css";

import { useMemo, useState } from "react";
import { Background, BackgroundVariant, Controls, Handle, Position, ReactFlow, type Node, type NodeProps, type NodeTypes } from "@xyflow/react";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
import type { BrandModule } from "@/lib/branding/modules";

type ArchitectureStatus = "Ativo" | "Parcial" | "Planejado";
type ArchitectureData = {
  label: string;
  module: BrandModule;
  status: ArchitectureStatus;
  files: string[];
  tables: string[];
  summary: string;
};

const details: Record<string, ArchitectureData> = {
  ecclesia: {
    label: "Ecclesia Core",
    module: "ecclesia",
    status: "Parcial",
    files: ["src/components/*Manager.tsx", "src/app/api/*", "src/app/actions/finance.ts"],
    tables: ["entries", "expenses", "headquarters_transfers", "physical_cash_*"],
    summary: "Núcleo transacional de entradas, despesas, repasses, caixa e correções.",
  },
  hiram: {
    label: "Hiram Architecture",
    module: "hiram",
    status: "Ativo",
    files: ["src/modules/core/hiram/README.md", "0012_hierarchical_financial_architecture.sql"],
    tables: ["congregations", "memberships", "membership_permission_overrides"],
    summary: "Hierarquia parent_id, níveis organizacionais, vocabulário e consolidação.",
  },
  khatam: {
    label: "Khatam Authenticate",
    module: "khatam",
    status: "Parcial",
    files: ["src/modules/core/khatam", "0013_khatam_licenses.sql"],
    tables: ["khatam_licenses", "memberships"],
    summary: "Licenças por unidade, validade e controle básico de vagas.",
  },
  elias: {
    label: "Elias Temp",
    module: "elias",
    status: "Ativo",
    files: ["src/components/ClosingManager.tsx", "src/app/(authenticated)/fechamento/page.tsx"],
    tables: ["monthly_closings", "period_reopening_requests", "congregation_monthly_summary"],
    summary: "Fechamento mensal, estados da competência e trava retroativa.",
  },
  enoch: {
    label: "Enoch Audit",
    module: "enoch",
    status: "Ativo",
    files: ["src/components/AuditLog.tsx", "src/app/(authenticated)/auditoria/page.tsx"],
    tables: ["audit_events"],
    summary: "Trilha consultável de mutações financeiras e administrativas.",
  },
  sefer: {
    label: "Sefer Reports",
    module: "sefer",
    status: "Ativo",
    files: ["src/lib/reports/data.ts", "src/components/ReportSummary.tsx"],
    tables: ["congregation_monthly_summary", "audit_events"],
    summary: "Prestação de contas em PDF e Excel.",
  },
  canaa: {
    label: "Canaã Access & Local",
    module: "canaa-local",
    status: "Parcial",
    files: ["src/modules/core/canaa", "src/app/(authenticated)/admin", "src/app/(authenticated)/canaa"],
    tables: ["congregations", "memberships", "khatam_licenses"],
    summary: "Gestão da hierarquia, unidade ativa, equipe e administração global.",
  },
  gideon: {
    label: "Gideon Security",
    module: "gideon",
    status: "Planejado",
    files: ["src/modules/plugins/gideon/README.md"],
    tables: [],
    summary: "Defesa de borda, Pix mTLS/DICT e cofre WORM previstos.",
  },
  shofeet: {
    label: "Shofeet Note",
    module: "shofeet",
    status: "Planejado",
    files: ["src/modules/plugins/shofeet/README.md"],
    tables: [],
    summary: "NF-e/NFC-e/NFS-e, XML, certificado A1 e ITG 2002/SPED previstos.",
  },
};

function ArchitectureNode({ data, selected }: NodeProps<Node<ArchitectureData>>) {
  const statusColor = data.status === "Ativo" ? "#38b26d" : data.status === "Parcial" ? "#d39a38" : "#718079";
  return (
    <div
      style={{
        width: 190,
        padding: 12,
        borderRadius: 16,
        border: selected ? "2px solid #65e0ae" : "1px solid #355f51",
        background: "#10241e",
        color: "#effaf5",
        boxShadow: "0 12px 28px rgba(0,0,0,.24)",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: "#65e0ae", border: 0 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <ModuleIcon module={data.module} size={34} decorative />
        <div style={{ minWidth: 0 }}>
          <b style={{ display: "block", fontSize: 12 }}>{data.label}</b>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 5, color: "#bdd0c7", fontSize: 10 }}>
            <i style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor }} />
            {data.status}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: "#65e0ae", border: 0 }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { architecture: ArchitectureNode };

export function ModuleArchitectureMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const nodes = useMemo<Node<ArchitectureData>[]>(() => [
    { id: "canaa", type: "architecture", position: { x: 20, y: 210 }, data: details.canaa },
    { id: "khatam", type: "architecture", position: { x: 240, y: 210 }, data: details.khatam },
    { id: "hiram", type: "architecture", position: { x: 460, y: 210 }, data: details.hiram },
    { id: "ecclesia", type: "architecture", position: { x: 680, y: 210 }, data: details.ecclesia },
    { id: "elias", type: "architecture", position: { x: 900, y: 210 }, data: details.elias },
    { id: "enoch", type: "architecture", position: { x: 1120, y: 210 }, data: details.enoch },
    { id: "sefer", type: "architecture", position: { x: 1340, y: 210 }, data: details.sefer },
    { id: "gideon", type: "architecture", position: { x: 680, y: 390 }, data: details.gideon },
    { id: "shofeet", type: "architecture", position: { x: 900, y: 390 }, data: details.shofeet },
  ], []);

  const edges = useMemo(() => [
    ["canaa", "khatam"], ["khatam", "hiram"], ["hiram", "ecclesia"], ["ecclesia", "elias"],
    ["elias", "enoch"], ["enoch", "sefer"], ["ecclesia", "gideon"], ["ecclesia", "shofeet"],
  ].map(([source, target]) => ({
    id: `${source}-${target}`,
    source,
    target,
    animated: details[source].status !== "Planejado",
    style: { stroke: details[target].status === "Planejado" ? "#718079" : "#65e0ae", strokeWidth: 1.8, strokeDasharray: details[target].status === "Planejado" ? "6 5" : undefined },
  })), []);

  const selected = selectedId ? details[selectedId] : null;

  return (
    <section style={{ position: "relative", display: "grid", gridTemplateColumns: selected ? "minmax(0, 1fr) 330px" : "1fr", height: 520, border: "1px solid #2f5145", borderRadius: 18, overflow: "hidden", background: "#091713" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        nodesDraggable
        nodesConnectable={false}
        onNodeClick={(_, node) => setSelectedId(node.id)}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#31584b" gap={22} size={1} variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} />
      </ReactFlow>
      {selected && (
        <aside style={{ borderLeft: "1px solid #2f5145", background: "#10241e", color: "#eaf6f1", padding: 18, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
            <div>
              <p style={{ margin: 0, color: "#78bba2", fontSize: 11, letterSpacing: ".08em", fontWeight: 800 }}>MÓDULO ECC</p>
              <h2 style={{ margin: "6px 0 8px", fontSize: 18 }}>{selected.label}</h2>
            </div>
            <button type="button" onClick={() => setSelectedId(null)} aria-label="Fechar painel" style={{ border: 0, background: "transparent", color: "#d4e6df", cursor: "pointer", fontSize: 20 }}>×</button>
          </div>
          <p style={{ color: "#bfd1c9", fontSize: 13, lineHeight: 1.55 }}>{selected.summary}</p>
          <h3 style={{ marginTop: 18, fontSize: 12, color: "#78bba2" }}>Arquivos reais</h3>
          <ul style={{ margin: 6, paddingLeft: 18, fontSize: 12, lineHeight: 1.7 }}>{selected.files.map((file) => <li key={file}><code>{file}</code></li>)}</ul>
          <h3 style={{ marginTop: 18, fontSize: 12, color: "#78bba2" }}>Tabelas / RPCs</h3>
          {selected.tables.length ? <ul style={{ margin: 6, paddingLeft: 18, fontSize: 12, lineHeight: 1.7 }}>{selected.tables.map((table) => <li key={table}><code>{table}</code></li>)}</ul> : <p style={{ fontSize: 12, color: "#9eb2a8" }}>Nenhuma integração ativa no workspace.</p>}
        </aside>
      )}
    </section>
  );
}
