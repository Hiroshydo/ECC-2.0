"use client";

import "@xyflow/react/dist/style.css";

import { Background, BackgroundVariant, Controls, ReactFlow, type Edge, type Node, type NodeTypes } from "@xyflow/react";

import { CongregationNode } from "@/modules/core/canaa/components/CongregationNode";
import type { CongregationNodeData } from "@/modules/core/canaa/types";

const nodeTypes: NodeTypes = { congregation: CongregationNode };

type FlowMapProps = {
  nodes?: Node<CongregationNodeData>[];
  edges?: Edge[];
};

export function CongregationFlowMap({ nodes = [], edges = [] }: FlowMapProps) {
  const normalizedEdges = edges.map((edge) => ({
    ...edge,
    type: "smoothstep",
    animated: true,
    style: { ...edge.style, stroke: "#10b981", strokeWidth: 2 },
  }));

  return (
    <div style={{ width: "100%", height: 420, border: "1px solid #dfeae6", borderRadius: 18, overflow: "hidden", background: "#f7faf8" }}>
      {nodes.length === 0 ? (
        <div style={{ display: "grid", width: "100%", height: "100%", placeItems: "center", color: "#52645d", fontSize: 14 }}>
          Sem congregações disponíveis.
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={normalizedEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background color="#9bb7aa" gap={18} size={1} variant={BackgroundVariant.Dots} />
          <Controls showInteractive={false} />
        </ReactFlow>
      )}
    </div>
  );
}
