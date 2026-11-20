"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import type { CongregationNodeData } from "@/modules/core/canaa/types";

export function CongregationNode({ data }: NodeProps<Node<CongregationNodeData>>) {
  const payload = data as CongregationNodeData;
  const active = Boolean(payload.active);
  const isHeadquarters = payload.organizationLevel && payload.organizationLevel !== "local_congregation";
  const licenseActive = payload.licenseActive !== false;
  const seatsUsed = payload.seatsUsed ?? 0;
  const seatsTotal = payload.seatsTotal ?? 0;
  const organizationType = payload.organizationType === "ong" ? "ONG" : "SEDE / MATRIZ";
  const levelLabel = payload.organizationLevel === "local_congregation"
    ? "CONGREGAÇÃO FILIAL"
    : organizationType;

  return (
    <div
      className="ecc-congregation-node"
      style={{
        width: 220,
        padding: "12px 14px 10px",
        border: "1px solid #bccdc4",
        borderRadius: 16,
        background: "#f9fdfb",
        boxShadow: "0 8px 24px rgba(14, 36, 30, 0.08)",
        color: "#0b1f1a",
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#287b65", border: "2px solid #fff", width: 10, height: 10 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", color: "#52645d" }}>{levelLabel}</span>
        <span aria-label={licenseActive && active ? "Khatam ativo" : "licença Khatam inativa"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: licenseActive && active ? "#287b65" : "#7b8983" }}>
          <i style={{ width: 8, height: 8, borderRadius: "50%", background: licenseActive && active ? "#38b26d" : "#97a7a0", boxShadow: licenseActive && active ? "0 0 0 0 rgba(56,178,109,.6)" : "none", animation: licenseActive && active ? "ecc-pulse 1.8s infinite" : "none" }} />
          {active ? "Ativa" : "Inativa"}
        </span>
      </div>
      <button
        type="button"
        onClick={payload.onToggleExpand}
        disabled={!isHeadquarters}
        style={{ display: "block", width: "100%", border: 0, background: "transparent", padding: "9px 0 7px", textAlign: "left", color: "#0b1f1a", cursor: isHeadquarters ? "pointer" : "default", fontSize: 14, fontWeight: 800 }}
        title={isHeadquarters ? (payload.expanded ? "Recolher filiais" : "Expandir filiais") : undefined}
      >
        {payload.name} {isHeadquarters ? (payload.expanded ? "▾" : "▸") : ""}
      </button>
      <div style={{ height: 5, borderRadius: 999, background: "#edf3ef", overflow: "hidden" }}>
        <div style={{ width: `${seatsTotal > 0 ? Math.min(100, seatsUsed / seatsTotal * 100) : 0}%`, height: "100%", background: "#287b65" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, fontSize: 11, color: "#66766f" }}>
        <span>{seatsUsed}/{seatsTotal} operadores</span>
        {payload.editable && payload.parentId && payload.onDisconnect && (
          <button type="button" onClick={payload.onDisconnect} style={{ border: 0, background: "transparent", color: "#8a4b3f", cursor: "pointer", fontSize: 11, fontWeight: 700, padding: 0 }}>
            Desvincular
          </button>
        )}
      </div>
      <div style={{ borderTop: "1px solid #edf3ef", marginTop: 8, paddingTop: 7, fontSize: 11, color: "#52645d" }}>
        {payload.parentId ? `Vinculada a ${payload.parentName ?? "matriz"}` : "Unidade Raiz"}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: "#287b65", border: "2px solid #fff", width: 10, height: 10 }} />
    </div>
  );
}
