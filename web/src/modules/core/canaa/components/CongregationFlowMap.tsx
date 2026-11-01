"use client";

import "@xyflow/react/dist/style.css";

import { Background, BackgroundVariant, Controls, ReactFlow, ReactFlowProvider, useReactFlow, type Edge, type Node, type NodeTypes } from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import { Network } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CongregationNode } from "@/modules/core/canaa/components/CongregationNode";
import type { CongregationNodeData } from "@/modules/core/canaa/types";

const NODE_WIDTH = 248;
const NODE_HEIGHT = 228;
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

function FitViewOnChange({ activeId, expansionKey }: { activeId: string | null; expansionKey: string }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.2, duration: 300 });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeId, expansionKey, fitView]);

  return null;
}

function FlowMapContent({ nodes = [], edges, activeId = null }: FlowMapProps) {
  const [expandedRootIds, setExpandedRootIds] = useState<Set<string>>(() => new Set());
  const nodesById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const rootIdByNodeId = useMemo(() => {
    const rootIds = new Map<string, string>();
    for (const node of nodes) {
      let current = node;
      const visited = new Set<string>();
      while (current.data.parentId && !visited.has(current.id)) {
        const parent = nodesById.get(current.data.parentId);
        if (!parent) break;
        visited.add(current.id);
        current = parent;
      }
      rootIds.set(node.id, current.id);
    }
    return rootIds;
  }, [nodes, nodesById]);
  const childCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const node of nodes) {
      if (node.data.parentId) counts.set(node.data.parentId, (counts.get(node.data.parentId) ?? 0) + 1);
    }
    return counts;
  }, [nodes]);
  const toggleRoot = useCallback((rootId: string) => {
    setExpandedRootIds((current) => {
      const next = new Set(current);
      if (next.has(rootId)) next.delete(rootId);
      else next.add(rootId);
      return next;
    });
  }, []);
  const visibleInputNodes = useMemo(() => nodes
    .filter((node) => {
      const parentIsInGraph = Boolean(node.data.parentId && nodesById.has(node.data.parentId));
      const rootId = rootIdByNodeId.get(node.id) ?? node.id;
      return !parentIsInGraph || expandedRootIds.has(rootId);
    })
    .map((node) => {
      const rootId = rootIdByNodeId.get(node.id) ?? node.id;
      const childCount = childCounts.get(node.id) ?? 0;
      return {
        ...node,
        data: {
          ...node.data,
          hasChildren: childCount > 0,
          childCount,
          expanded: expandedRootIds.has(node.id),
          onToggle: () => toggleRoot(rootId),
        },
      };
    }), [childCounts, expandedRootIds, nodes, nodesById, rootIdByNodeId, toggleRoot]);
  const flow = useMemo(() => layoutNodes(visibleInputNodes, activeId), [visibleInputNodes, activeId]);
  const visibleNodeIds = useMemo(() => new Set(flow.nodes.map((node) => node.id)), [flow.nodes]);
  const visibleEdges = (edges ?? flow.edges).filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  const expansionKey = [...expandedRootIds].sort().join(",");

  if (flow.nodes.length === 0) {
    return (
      <div className="congregation-flow-map-card">
        <div className="congregation-flow-map-hint">Clique em uma Sede Matriz para expandir ou recolher suas congregações filiais.</div>
        <div className="congregation-flow-map congregation-flow-map--empty" role="status">
          <Network size={20} strokeWidth={1.6} aria-hidden="true" />
          <span>Nenhuma congregação disponível.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="congregation-flow-map-card">
      <div className="congregation-flow-map-hint">Clique em uma Sede Matriz para expandir ou recolher suas congregações filiais.</div>
      <div className="congregation-flow-map" aria-label="Mapa hierárquico de congregações">
        <ReactFlow
          nodes={flow.nodes}
          edges={visibleEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
        >
          <FitViewOnChange activeId={activeId} expansionKey={expansionKey} />
          <Background color="var(--ecc-border)" gap={20} size={1} variant={BackgroundVariant.Dots} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
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
