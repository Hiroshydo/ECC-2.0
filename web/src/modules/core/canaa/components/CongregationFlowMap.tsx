"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";

import { CongregationNode } from "@/modules/core/canaa/components/CongregationNode";
import type { CongregationNodeData } from "@/modules/core/canaa/types";

const nodeTypes: NodeTypes = { congregation: CongregationNode };

type FlowMapProps = {
  nodes?: Node<CongregationNodeData>[];
  edges?: Edge[];
  editable?: boolean;
  onLinkChange?: (childId: string, parentId: string | null) => Promise<void>;
};

function applyHierarchyLayout(nodes: Node<CongregationNodeData>[], edges: Edge[]) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "TB", ranksep: 80, nodesep: 70, marginx: 24, marginy: 24 });
  nodes.forEach((node) => graph.setNode(node.id, { width: 220, height: 190 }));
  edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  dagre.layout(graph);
  return nodes.map((node) => ({
    ...node,
    position: {
      x: (graph.node(node.id)?.x ?? 0) - 110,
      y: (graph.node(node.id)?.y ?? 0) - 95,
    },
  }));
}

export function CongregationFlowMap({ nodes = [], edges = [], editable = false, onLinkChange }: FlowMapProps) {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(nodes.filter((node) => node.data.organizationLevel !== "local_congregation").map((node) => node.id)));
  const [flowNodes, setFlowNodes] = useState<Node<CongregationNodeData>[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(null);

  const baseEdges = useMemo(() => edges.map((edge) => ({ ...edge, animated: editable, style: { stroke: "#287b65", strokeWidth: 1.5, strokeDasharray: "7 5" } })), [edges, editable]);

  useEffect(() => {
    const visibleIds = new Set<string>();
    nodes.forEach((node) => visibleIds.add(node.id));
    const visibleNodes = nodes.filter((node) => {
      if (!node.data.parentId) return true;
      const parentId = node.data.parentId;
      if (!expandedIds.has(parentId)) return false;
      return true;
    });
    const visibleEdges = baseEdges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
    const frame = window.requestAnimationFrame(() => {
      setFlowNodes(applyHierarchyLayout(visibleNodes, visibleEdges));
      setFlowEdges(visibleEdges);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [nodes, baseEdges, expandedIds]);

  useEffect(() => {
    if (!flowInstance) return;
    window.requestAnimationFrame(() => void flowInstance.fitView({ padding: 0.24, duration: 420 }));
  }, [flowNodes, flowInstance]);

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const linkChange = useCallback(async (childId: string, parentId: string | null) => {
    try {
      if (onLinkChange) {
        await onLinkChange(childId, parentId);
      } else {
        const response = await fetch(`/api/admin/congregations/${encodeURIComponent(childId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parent_id: parentId }),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Não foi possível atualizar o vínculo.");
      }

      const parentName = parentId ? flowNodes.find((node) => node.id === parentId)?.data.name ?? null : null;
      setFlowNodes((current) => applyHierarchyLayout(
        current.map((node) => node.id === childId
          ? { ...node, data: { ...node.data, parentId, parentName } }
          : node),
        flowEdges
          .filter((edge) => edge.target !== childId)
          .concat(parentId ? [{ id: `${parentId}-${childId}`, source: parentId, target: childId, animated: editable, style: { stroke: "#287b65", strokeWidth: 1.5, strokeDasharray: "7 5" } }] : []),
      ));
      setFlowEdges((current) => current
        .filter((edge) => edge.target !== childId)
        .concat(parentId ? [{ id: `${parentId}-${childId}`, source: parentId, target: childId, animated: editable, style: { stroke: "#287b65", strokeWidth: 1.5, strokeDasharray: "7 5" } }] : []));
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Não foi possível atualizar o vínculo.");
    }
  }, [onLinkChange, flowNodes, flowEdges, editable, router]);

  const nodesWithActions = useMemo(() => flowNodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      editable,
      expanded: expandedIds.has(node.id),
      onToggleExpand: () => toggleExpand(node.id),
      onDisconnect: editable ? () => void linkChange(node.id, null) : undefined,
    },
  })), [flowNodes, editable, expandedIds, toggleExpand, linkChange]);

  const handleConnect = useCallback((connection: Connection) => {
    if (!editable || !connection.source || !connection.target) return;
    if (connection.source === connection.target) return;
    void linkChange(connection.target, connection.source);
  }, [editable, linkChange]);

  const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    if (!editable) return;
    if (window.confirm("Desvincular esta unidade da matriz?")) void linkChange(edge.target, null);
  }, [editable, linkChange]);

  return (
    <div style={{ width: "100%", height: 500, border: "1px solid #dfeae6", borderRadius: 18, overflow: "hidden", background: "#f7faf8" }}>
      <ReactFlow
        nodes={nodesWithActions}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.24, duration: 420 }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable
        onConnect={handleConnect}
        onEdgeClick={handleEdgeClick}
        onInit={setFlowInstance}
      >
        <Background color="#9bb7aa" gap={18} size={1} variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
