'use client';

import React, { useState } from 'react';
import type { WorkflowNode, WorkflowEdge, NodeExecutionState } from '@/types/dify/workflow';

type WorkflowCanvasProps = {
  appId: string;
  initialNodes?: WorkflowNode[];
  initialEdges?: WorkflowEdge[];
};

const defaultInitialNodes: WorkflowNode[] = [
  {
    id: 'node-start',
    type: 'start',
    title: 'Start',
    desc: 'Receives user query and incoming variables',
    position: { x: 80, y: 150 },
    data: { variables: ['query'] },
  },
  {
    id: 'node-knowledge',
    type: 'knowledge-retrieval',
    title: 'Knowledge Retrieval',
    desc: 'Retrieves relevant chunks from documentation',
    position: { x: 380, y: 150 },
    data: { dataset_id: 'default', top_k: 3 },
  },
  {
    id: 'node-llm',
    type: 'llm',
    title: 'LLM Synthesis',
    desc: 'Generates answer based on query & context',
    position: { x: 680, y: 150 },
    data: { model: 'gpt-4o', temperature: 0.7 },
  },
  {
    id: 'node-end',
    type: 'end',
    title: 'End Response',
    desc: 'Outputs answer to user',
    position: { x: 980, y: 150 },
    data: { output: '{{llm.text}}' },
  },
];

const defaultInitialEdges: WorkflowEdge[] = [
  { id: 'e1', source: 'node-start', target: 'node-knowledge' },
  { id: 'e2', source: 'node-knowledge', target: 'node-llm' },
  { id: 'e3', source: 'node-llm', target: 'node-end' },
];

export function WorkflowCanvas({
  initialNodes = defaultInitialNodes,
  initialEdges = defaultInitialEdges,
}: WorkflowCanvasProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [edges] = useState<WorkflowEdge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  // Trace execution state
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [traceSteps, setTraceSteps] = useState<NodeExecutionState[]>([]);

  // Dragging node state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    setDraggedNodeId(node.id);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNodeId) return;
    const newX = Math.max(20, e.clientX - dragOffset.x);
    const newY = Math.max(20, e.clientY - dragOffset.y);

    setNodes((prev) =>
      prev.map((n) => (n.id === draggedNodeId ? { ...n, position: { x: newX, y: newY } } : n)),
    );
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  const getNodeColor = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'start':
        return 'border-emerald-300 bg-emerald-50/50 text-emerald-700';
      case 'end':
        return 'border-green-400 bg-green-50/50 text-green-700';
      case 'llm':
        return 'border-blue-300 bg-blue-50/50 text-blue-700';
      case 'knowledge-retrieval':
        return 'border-amber-300 bg-amber-50/50 text-amber-700';
      case 'code':
        return 'border-purple-300 bg-purple-50/50 text-purple-700';
      case 'if-else':
        return 'border-indigo-300 bg-indigo-50/50 text-indigo-700';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  const runWorkflowTest = async () => {
    setIsRunning(true);
    setIsTraceOpen(true);
    setTraceSteps([
      { nodeId: 'node-start', status: 'running' },
    ]);

    await new Promise((r) => setTimeout(r, 600));
    setTraceSteps([
      { nodeId: 'node-start', status: 'succeeded', outputs: { query: 'Summarize Dify SaaS benefits' }, elapsed_time: 0.05 },
      { nodeId: 'node-knowledge', status: 'running' },
    ]);

    await new Promise((r) => setTimeout(r, 700));
    setTraceSteps([
      { nodeId: 'node-start', status: 'succeeded', outputs: { query: 'Summarize Dify SaaS benefits' }, elapsed_time: 0.05 },
      { nodeId: 'node-knowledge', status: 'succeeded', outputs: { chunks: 3, score: 0.89 }, elapsed_time: 0.22 },
      { nodeId: 'node-llm', status: 'running' },
    ]);

    await new Promise((r) => setTimeout(r, 900));
    setTraceSteps([
      { nodeId: 'node-start', status: 'succeeded', outputs: { query: 'Summarize Dify SaaS benefits' }, elapsed_time: 0.05 },
      { nodeId: 'node-knowledge', status: 'succeeded', outputs: { chunks: 3, score: 0.89 }, elapsed_time: 0.22 },
      { nodeId: 'node-llm', status: 'succeeded', outputs: { text: 'Next.js SaaS Boilerplate provides Tailwind v4 styling and clean orchestration.' }, elapsed_time: 0.74, total_tokens: 382 },
      { nodeId: 'node-end', status: 'succeeded', outputs: { answer: 'Next.js SaaS Boilerplate provides Tailwind v4 styling and clean orchestration.' }, elapsed_time: 0.01 },
    ]);
    setIsRunning(false);
  };

  return (
    <div
      className="relative h-full w-full select-none overflow-hidden bg-slate-50/50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Background Dot Grid */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-20">
        <defs>
          <pattern id="grid-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#94A3B8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-dots)" />
      </svg>

      {/* SVG Connecting Edges */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none z-0">
        {edges.map((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          const startX = sourceNode.position.x + 220;
          const startY = sourceNode.position.y + 40;
          const endX = targetNode.position.x;
          const endY = targetNode.position.y + 40;
          const deltaX = Math.abs(endX - startX) * 0.5;

          const d = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

          return (
            <path
              key={edge.id}
              d={d}
              fill="none"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>

      {/* Canvas Controls Floating Bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 p-1.5 shadow-xs backdrop-blur-xs">
        <button
          type="button"
          onClick={runWorkflowTest}
          disabled={isRunning}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-500 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
              Running...
            </>
          ) : (
            <>▶ Run Test DAG</>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsTraceOpen(!isTraceOpen)}
          className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {isTraceOpen ? 'Hide Execution Trace' : 'View Execution Trace'}
        </button>
      </div>

      {/* Workflow Nodes */}
      {nodes.map((node) => {
        const isSelected = selectedNode?.id === node.id;
        const colorClass = getNodeColor(node.type);

        return (
          <div
            key={node.id}
            onMouseDown={(e) => handleMouseDown(e, node)}
            onClick={() => setSelectedNode(node)}
            style={{
              transform: `translate(${node.position.x}px, ${node.position.y}px)`,
              cursor: draggedNodeId === node.id ? 'grabbing' : 'grab',
            }}
            className={`absolute top-0 left-0 z-10 w-56 rounded-2xl border bg-white p-4 shadow-xs transition-shadow hover:shadow-md ${
              isSelected ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'border-gray-200'
            }`}
          >
            {/* Input Port Handle */}
            {node.type !== 'start' && (
              <div className="absolute -left-2 top-9 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-xs" />
            )}

            {/* Node Card Header */}
            <div className="flex items-center gap-2">
              <span className={`rounded-md border px-2 py-0.5 text-2xs font-bold uppercase tracking-wider ${colorClass}`}>
                {node.type}
              </span>
            </div>

            <h4 className="mt-2 text-sm font-bold text-gray-900">{node.title}</h4>
            <p className="mt-1 text-2xs text-gray-500 line-clamp-2">{node.desc}</p>

            {/* Output Port Handle */}
            {node.type !== 'end' && (
              <div className="absolute -right-2 top-9 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-xs" />
            )}
          </div>
        );
      })}

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <aside className="absolute right-0 top-0 bottom-0 z-20 w-80 border-l border-gray-200 bg-white p-6 shadow-xl overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-2xs font-semibold uppercase text-gray-400">Node Configuration</span>
              <h3 className="text-base font-bold text-gray-900">{selectedNode.title}</h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 rounded-lg p-1 text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">Node Title</label>
              <input
                type="text"
                value={selectedNode.title}
                onChange={(e) => {
                  const val = e.target.value;
                  setNodes((prev) =>
                    prev.map((n) => (n.id === selectedNode.id ? { ...n, title: val } : n)),
                  );
                  setSelectedNode((prev) => (prev ? { ...prev, title: val } : null));
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">Description</label>
              <textarea
                rows={2}
                value={selectedNode.desc || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setNodes((prev) =>
                    prev.map((n) => (n.id === selectedNode.id ? { ...n, desc: val } : n)),
                  );
                  setSelectedNode((prev) => (prev ? { ...prev, desc: val } : null));
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-700">Parameters</p>
              <pre className="mt-2 text-2xs font-mono text-gray-600 overflow-x-auto">
                {JSON.stringify(selectedNode.data, null, 2)}
              </pre>
            </div>
          </div>
        </aside>
      )}

      {/* Execution Trace Bottom Drawer */}
      {isTraceOpen && (
        <aside className="absolute bottom-0 left-0 right-0 z-20 max-h-64 border-t border-gray-200 bg-white p-5 shadow-2xl overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              DAG Execution Trace
            </h4>
            <button
              onClick={() => setIsTraceOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-2">
            {traceSteps.map((step) => (
              <div
                key={step.nodeId}
                className="flex min-w-[200px] flex-col rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-900">{step.nodeId}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-2xs font-bold ${
                      step.status === 'succeeded'
                        ? 'bg-emerald-100 text-emerald-800'
                        : step.status === 'running'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
                {step.elapsed_time !== undefined && (
                  <p className="mt-1 text-2xs text-gray-500">{step.elapsed_time}s</p>
                )}
                {step.total_tokens !== undefined && (
                  <p className="text-2xs text-gray-500">{step.total_tokens} tokens</p>
                )}
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
