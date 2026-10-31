"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import type { CongregationNodeData } from "@/modules/core/canaa/types";

export function CongregationNode({ data }: NodeProps<Node<CongregationNodeData>>) {
  const payload = data as CongregationNodeData;
  const active = Boolean(payload.active);
  const seatsUsed = Number(payload.seatsUsed ?? 0);
  const seatsTotal = Number(payload.seatsTotal ?? 0);

  return (
    <div
      style={{
        minWidth: 150,
        padding: "12px 14px",
        border: "1px solid #bccdc4",
        borderRadius: 14,
        background: "#f9fdfb",
        boxShadow: "0 8px 24px rgba(14, 36, 30, 0.08)",
        color: "#0b1f1a",
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#0b1f1a", border: "none", width: 8, height: 8 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#52645d" }}>
          {active ? "Ativa" : "Inativa"}
        </span>
        <span
          aria-label={active ? "congregação ativa" : "congregação inativa"}
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            display: "inline-block",
            background: active ? "#38b26d" : "#97a7a0",
            boxShadow: active ? "0 0 0 0 rgba(56, 178, 109, 0.6)" : "none",
            animation: active ? "ecc-pulse 1.8s infinite" : "none",
          }}
        />
      </div>
      <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700 }}>{payload.name}</div>
      <div style={{ marginTop: 8, color: "#52645d", fontSize: 12 }}>Cota Khatam: {seatsUsed}/{seatsTotal}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: "#0b1f1a", border: "none", width: 8, height: 8 }} />
    </div>
  );
}
