"use client";

import "@xyflow/react/dist/style.css";

import { Background, BackgroundVariant, Controls, ReactFlow, ReactFlowProvider, useReactFlow, type Edge, type Node, type NodeTypes } from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import { Network } from "lucide-react";
import { useEffect, useMemo } from "react";

import { CongregationNode } from "@/modules/core/canaa/components/CongregationNode";
import type { CongregationNodeData } from "@/modules/core/canaa/types";

const NODE_WIDTH = 248;
const NODE_HEIGHT = 144;
const nodeTypes: NodeTypes = { congregation: CongregationNode };

type FlowMapProps = {
  nodes?: Node<CongregationNodeData>[];
  edges?: Edge[];
  activeId?: string | null;
};

function reaches(startId: string, targetId: string, adjacency: Map<string, Set<string>>) {
  const pending = [startId];
  const visited = new Set<string>();

  while (pending.length > 0) {
    const currentId = pending.pop();
    if (!currentId || visited.has(currentId)) continue;
    if (currentId === targetId) return true;
    visited.add(currentId);
    pending.push(...(adjacency.get(currentId) ?? []));
  }

  return false;
}

function layoutNodes(nodes: Node<CongregationNodeData>[], activeId: string | null) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "TB",
    nodesep: 56,
    ranksep: 76,
    marginx: 32,
    marginy: 28,
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const adjacency = new Map<string, Set<string>>();
  const edges: Edge[] = [];

  for (const node of nodes) {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    adjacency.set(node.id, new Set());
  }

  const orderedNodes = [...nodes].sort((left, right) => left.data.name.localeCompare(right.data.name, "pt-BR"));
  for (const node of orderedNodes) {
    const parentId = node.data.parentId;
    if (!parentId || !nodeIds.has(parentId) || reaches(node.id, parentId, adjacency)) continue;

    adjacency.get(parentId)?.add(node.id);
    graph.setEdge(parentId, node.id);
    edges.push({
      id: `${parentId}-${node.id}`,
      source: parentId,
      target: node.id,
      type: "step",
      style: { stroke: "var(--ecc-muted-soft)", strokeWidth: 1.5, strokeDasharray: "5 5" },
    });
  }

  dagre.layout(graph);

  const positionedNodes = nodes.map((node) => {
    const layout = graph.node(node.id) as { x: number; y: number };
    return {
      ...node,
      position: {
        x: layout.x - NODE_WIDTH / 2,
        y: layout.y - NODE_HEIGHT / 2,
      },
      data: {
        ...node.data,
        selected: node.id === activeId,
      },
    };
  });

  return { nodes: positionedNodes, edges };
}

function FitViewOnActiveChange({ activeId }: { activeId: string | null }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.18, duration: 180 });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeId, fitView]);

  return null;
}

function FlowMapContent({ nodes = [], edges, activeId = null }: FlowMapProps) {
  const flow = useMemo(() => layoutNodes(nodes, activeId), [nodes, activeId]);
  const visibleEdges = edges ?? flow.edges;

  if (flow.nodes.length === 0) {
    return (
      <div className="congregation-flow-map congregation-flow-map--empty" role="status">
        <Network size={20} strokeWidth={1.6} aria-hidden="true" />
        <span>Nenhuma congregação disponível.</span>
      </div>
    );
  }

  return (
    <div className="congregation-flow-map" aria-label="Mapa hierárquico de congregações">
      <ReactFlow
        nodes={flow.nodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <FitViewOnActiveChange activeId={activeId} />
        <Background color="var(--ecc-border)" gap={20} size={1} variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export function CongregationFlowMap(props: FlowMapProps) {
  return (
    <ReactFlowProvider>
      <FlowMapContent {...props} />
    </ReactFlowProvider>
  );
}
