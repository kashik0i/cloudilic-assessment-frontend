import {useTheme} from "@/components/theme-provider.tsx";
import {
    addEdge,
    Background,
    Controls,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
    type Connection,
    type Edge,
    type Node
} from "@xyflow/react";
import {useCallback, useState, useRef, useEffect} from "react";
import {nodeTypes} from "@/components/nodes";
import type {FlowNodeData, FlowNodeType} from "@/interfaces.ts";
import {Button} from "@/components/ui/button";
import {Play, Loader2, RotateCcw} from "lucide-react";
import { useWorkflowExecution } from "@/hooks/use-workflow-execution.ts";
import * as React from "react";

// Initial starter nodes (optional). Can be removed if empty canvas desired.
const initialNodes: Node<FlowNodeData, FlowNodeType>[] = [
    // {id: "n1", position: {x: 0, y: 0}, data: {label: "Question?"}, type: "inputNode"},
    // {id: "n2", position: {x: 260, y: 0}, data: {label: "RAG"}, type: "ragNode"},
    // {id: "n3", position: {x: 520, y: 0}, data: {label: "Output"}, type: "outputNode"},
];

const initialEdges: Edge[] = [
    // {id: "n1-n2", source: "n1", target: "n2", animated: false},
    // {id: "n2-n3", source: "n2", target: "n3", animated: true},
];

// Small unique id helper.
function makeId(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function FlowCanvasInner() {
    const {theme} = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition } = useReactFlow();
    const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);

    const exec = useWorkflowExecution(nodes, setNodes, edges);
    const execRunRef = useRef(exec.run);

    // Keep the ref updated with the latest exec.run (no useEffect needed, just update it each render)
    execRunRef.current = exec.run;

    const onConnect = useCallback(
        (params: Connection) => setEdges((els) => addEdge(params, els)),
        [setEdges]
    );

    // Allow dropping new nodes from sidebar.
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const raw = event.dataTransfer.getData("application/reactflow");
        if (!raw) return;
        let payload: { type: FlowNodeType; data?: Record<string, unknown> } | null = null;
        try {
            payload = JSON.parse(raw);
        } catch {
            return;
        }
        if (!payload || !payload.type || !(payload.type in nodeTypes)) return;

        const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const position = screenToFlowPosition({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
        });

        const id = makeId(payload.type);
        const newNode: Node<FlowNodeData, FlowNodeType> = {
            id,
            type: payload.type,
            position,
            data: {
                label: payload.type,
                ...(payload.data || {}),
            },
        };
        setNodes((nds) => nds.concat(newNode));
    }, [screenToFlowPosition, setNodes]);

    // Handle keyboard deletion of selected edges.
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEdgeIds.length) {
            setEdges(prev => prev.filter(ed => !selectedEdgeIds.includes(ed.id)));
            setSelectedEdgeIds([]);
        }
    }, [selectedEdgeIds, setEdges]);

    const handleSelectionChange = useCallback(({ edges }: { edges: Edge[] }) => {
        setSelectedEdgeIds(edges.map(e => e.id));
    }, []);

    // Determine loading state by checking output node flag
    const isRunning = (nodes.find(n => n.type === 'outputNode')?.data as any)?.isLoading || false;

    useEffect(() => {
        const handler = () => execRunRef.current();
        window.addEventListener("workflow/run", handler as EventListener);
        return () => window.removeEventListener("workflow/run", handler as EventListener);
    }, []);

    return (
        <div
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Flow canvas"
            className="outline-none focus:ring-2 focus:ring-blue-500"
            style={{width: "100%", height: "100%", position: "relative"}}
        >
            <ReactFlow
                colorMode={theme === "system" ? "dark" : theme}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                onDrop={onDrop}
                onDragOver={onDragOver}
                onSelectionChange={handleSelectionChange}
            >
                <Background />
                <Controls />
            </ReactFlow>
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                    onClick={exec.resetSession}
                    disabled={isRunning}
                    variant="outline"
                    size="lg"
                    className="shadow-lg"
                    title="Reset session and clear chat history"
                >
                    <RotateCcw className="h-4 w-4" />
                    <span className="ml-2">Reset Session</span>
                </Button>
                <Button onClick={exec.run} disabled={isRunning} size="lg" className="shadow-lg">
                    {isRunning ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Running...</span>
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4" />
                            <span className="ml-2">Run Flow</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

export function FlowCanvas() {
    return (
        <div style={{width: "100%", height: "100vh", position: "relative"}}>
            <ReactFlowProvider>
                <FlowCanvasInner />
            </ReactFlowProvider>
        </div>
    );
}
