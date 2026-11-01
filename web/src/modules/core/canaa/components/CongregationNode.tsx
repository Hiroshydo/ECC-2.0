"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import type { CongregationNodeData } from "@/modules/core/canaa/types";

export function CongregationNode({ data }: NodeProps<Node<CongregationNodeData>>) {
  const payload = data as CongregationNodeData;
  const active = Boolean(payload.active);
  const badgeLabel = payload.organizationType === "ong"
    ? "ONG"
    : payload.parentId
      ? "CONGREGAÇÃO FILIAL"
      : "SEDE / MATRIZ";
  const badgeStyle = payload.organizationType === "ong"
    ? { background: "#e0e7ff", color: "#3730a3" }
    : payload.parentId
      ? { background: "#d1fae5", color: "#047857" }
      : { background: "#064e3b", color: "#ffffff" };

  return (
    <div
      style={{
        width: 248,
        padding: 16,
        border: `1px solid ${active ? "#a7d8c3" : "#d5dfda"}`,
        borderRadius: 16,
        background: "#ffffff",
        boxShadow: "0 10px 28px rgba(14, 36, 30, 0.1)",
        color: "#0b1f1a",
        position: "relative",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white"
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ ...badgeStyle, display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "5px 9px", fontSize: 9, fontWeight: 800, letterSpacing: "0.06em" }}>
          {badgeLabel}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: active ? "#047857" : "#64748b", fontSize: 11, fontWeight: 700 }}>
          <span style={{ position: "relative", display: "inline-flex", width: 9, height: 9 }}>
            {active ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /> : null}
            <span style={{ position: "relative", width: 9, height: 9, borderRadius: "50%", background: active ? "#10b981" : "#94a3b8" }} />
          </span>
          {active ? "Ativa" : "Inativa"}
        </span>
      </div>
      <div style={{ marginTop: 12, minHeight: 40, fontSize: 15, fontWeight: 750, lineHeight: 1.35 }}>{payload.name}</div>
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #edf3f1", color: "#52645d", fontSize: 11, fontWeight: 600 }}>
        {payload.parentLabel}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white"
      />
    </div>
  );
}
