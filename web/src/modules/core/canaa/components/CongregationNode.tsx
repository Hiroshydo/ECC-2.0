"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import type { CongregationNodeData } from "@/modules/core/canaa/types";

export function CongregationNode({ data }: NodeProps<Node<CongregationNodeData>>) {
  const payload = data as CongregationNodeData;
  const active = Boolean(payload.active);
  const selected = Boolean(payload.selected);
  const badgeLabel = payload.organizationType === "ong"
    ? "ONG"
    : payload.parentId
      ? "CONGREGAÇÃO FILIAL"
      : "SEDE / MATRIZ";
  const badgeType = payload.organizationType === "ong"
    ? "is-ngo"
    : payload.parentId
      ? "is-branch"
      : "is-headquarters";

  return (
    <div className={`congregation-node${selected ? " is-selected" : ""}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white"
      />
      <div className="congregation-node__top">
        <span className={`congregation-node__badge ${badgeType}`}>
          {badgeLabel}
        </span>
        <span className={`congregation-node__status${active ? " is-active" : ""}`}>
          <span className="congregation-node__indicator" aria-hidden="true">
            {active ? <span className="congregation-node__pulse" /> : null}
            <span className="congregation-node__dot" />
          </span>
          {active ? "Ativa" : "Inativa"}
        </span>
      </div>
      <div className="congregation-node__name">{payload.name}</div>
      <div className="congregation-node__parent">{payload.parentLabel}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white"
      />
    </div>
  );
}
