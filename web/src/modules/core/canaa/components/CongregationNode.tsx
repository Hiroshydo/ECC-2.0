"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import type { CongregationNodeData } from "@/modules/core/canaa/types";

export function CongregationNode({ data }: NodeProps<Node<CongregationNodeData>>) {
  const payload = data as CongregationNodeData;
  const active = Boolean(payload.active);
  const selected = Boolean(payload.selected);
  const canExpand = !payload.parentId && Boolean(payload.hasChildren);
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
  const location = payload.city
    ? `${payload.city}${payload.state ? `/${payload.state}` : ""}`
    : payload.organizationType === "ong"
      ? "Organização"
      : "Localização não informada";
  const licenseLabel = payload.licenseStatus === "active"
    ? "Licença ativa"
    : payload.licenseStatus === "grace_period"
      ? "Em carência"
      : payload.licenseStatus === "blocked"
        ? "Licença bloqueada"
        : "Sem licença";
  const operatorLabel = payload.operatorCount === null || payload.operatorCount === undefined
    ? "Operadores indisponíveis"
    : `${payload.operatorCount} ${payload.operatorCount === 1 ? "operador" : "operadores"}`;

  return (
    <div
      className={`congregation-node${selected ? " is-selected" : ""}${payload.expanded ? " is-expanded" : ""}${canExpand ? " is-expandable" : ""}`}
      onClick={canExpand ? payload.onToggle : undefined}
    >
      {payload.parentId ? <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white" /> : null}
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
      <div className="congregation-node__details">
        <span>{location}</span>
        {payload.leaderName ? <span>{payload.organizationType === "ong" ? "Diretor" : "Pastor titular"} · {payload.leaderName}</span> : null}
      </div>
      <div className="congregation-node__metrics">
        <span>{licenseLabel}</span>
        <span>{operatorLabel}</span>
      </div>
      <div className="congregation-node__footer">
        {canExpand ? (
          <button
            type="button"
            className="congregation-node__toggle nodrag"
            aria-expanded={Boolean(payload.expanded)}
            onClick={(event) => {
              event.stopPropagation();
              payload.onToggle?.();
            }}
          >
            {payload.expanded ? "▴ Ocultar filiais" : `▾ Ver ${payload.childCount ?? 0} ${payload.childCount === 1 ? "filial" : "filiais"}`}
          </button>
        ) : (
          <span className="congregation-node__parent">{payload.parentId ? payload.parentLabel : "Unidade Raiz · Sem filiais"}</span>
        )}
      </div>
      {payload.hasChildren ? <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white" /> : null}
    </div>
  );
}
