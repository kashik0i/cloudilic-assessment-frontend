import {useTheme} from "@/components/theme-provider.tsx";
import {
    addEdge,
    Background,
    Controls,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    type Connection,
    type Edge,
    type Node
} from "@xyflow/react";
import {useCallback, useState} from "react";
import {nodeTypes} from "@/components/nodes";
import type {FlowNodeData, FlowNodeType} from "@/interfaces.ts";
import {Button} from "@/components/ui/button";
import {Play, Loader2} from "lucide-react";

const initialNodes: Node<FlowNodeData, FlowNodeType>[] = [
    {id: "n1", position: {x: 0, y: 0}, data: {label: "Node 1"}, type: "inputNode"},
    {id: "n2", position: {x: 100, y: 0}, data: {label: "Node 2"}, type: "ragNode"},
    {id: "n3", position: {x: 0, y: 100}, data: {label: "Node 3"}, type: "outputNode"},
];

const initialEdges: Edge[] = [
    {id: "n1-n2", source: "n1", target: "n2", animated: false},
    {id: "n2-n3-2", source: "n2", target: "n3", animated: true},
];

export function FlowCanvas() {
    const {theme} = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isRunning, setIsRunning] = useState(false);

    const onConnect = useCallback(
        (params: Connection) => setEdges((els) => addEdge(params, els)),
        [setEdges]
    );

    const runFlow = useCallback(async () => {
        setIsRunning(true);

        // Find the input, RAG, and output nodes
        const inputNode = nodes.find((n) => n.type === "inputNode");
        const ragNode = nodes.find((n) => n.type === "ragNode");
        const outputNode = nodes.find((n) => n.type === "outputNode");

        if (!inputNode || !ragNode || !outputNode) {
            // Update output node with error
            setNodes((prevNodes) =>
                prevNodes.map((n) =>
                    n.type === "outputNode"
                        ? {
                              ...n,
                              data: {
                                  ...n.data,
                                  error: "Please ensure Input, RAG, and Output nodes are all present in the flow",
                                  isLoading: false,
                                  response: undefined,
                              },
                          }
                        : n
                )
            );
            setIsRunning(false);
            return;
        }

        // Extract data from nodes
        const prompt = (inputNode.data as any)?.prompt || (inputNode.data as any)?.label || "";
        const documentId = (ragNode.data as any)?.documentId;

        if (!prompt.trim()) {
            setNodes((prevNodes) =>
                prevNodes.map((n) =>
                    n.type === "outputNode"
                        ? {
                              ...n,
                              data: {
                                  ...n.data,
                                  error: "Please enter a question in the Input node",
                                  isLoading: false,
                                  response: undefined,
                              },
                          }
                        : n
                )
            );
            setIsRunning(false);
            return;
        }

        if (!documentId) {
            setNodes((prevNodes) =>
                prevNodes.map((n) =>
                    n.type === "outputNode"
                        ? {
                              ...n,
                              data: {
                                  ...n.data,
                                  error: "Please upload a PDF in the RAG node",
                                  isLoading: false,
                                  response: undefined,
                              },
                          }
                        : n
                )
            );
            setIsRunning(false);
            return;
        }

        // Set output node to loading state
        setNodes((prevNodes) =>
            prevNodes.map((n) =>
                n.type === "outputNode"
                    ? {
                          ...n,
                          data: {
                              ...n.data,
                              isLoading: true,
                              error: undefined,
                              response: undefined,
                          },
                      }
                    : n
            )
        );

        try {
            // Call backend API to process the query
            const response = await fetch("http://localhost:4000/api/query", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt,
                    documentId,
                }),
            });

            if (!response.ok) {
                throw new Error(`Query failed: ${response.statusText}`);
            }

            const result = await response.json();

            // Update output node with response
            setNodes((prevNodes) =>
                prevNodes.map((n) =>
                    n.type === "outputNode"
                        ? {
                              ...n,
                              data: {
                                  ...n.data,
                                  response: result.response || result.answer || "No response received",
                                  isLoading: false,
                                  error: undefined,
                              },
                          }
                        : n
                )
            );
        } catch (error) {
            // Update output node with error
            setNodes((prevNodes) =>
                prevNodes.map((n) =>
                    n.type === "outputNode"
                        ? {
                              ...n,
                              data: {
                                  ...n.data,
                                  error: error instanceof Error ? error.message : "Failed to process query",
                                  isLoading: false,
                                  response: undefined,
                              },
                          }
                        : n
                )
            );
        } finally {
            setIsRunning(false);
        }
    }, [nodes, setNodes]);

    return (
        <div style={{width: "100%", height: "100vh", position: "relative"}}>
            <ReactFlowProvider>
                <ReactFlow
                    colorMode={theme === "system" ? "dark" : theme}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background/>
                    <Controls/>
                </ReactFlow>

                {/* Run Flow Button */}
                <div className="absolute top-4 right-4 z-10">
                    <Button
                        onClick={runFlow}
                        disabled={isRunning}
                        size="lg"
                        className="shadow-lg"
                    >
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
            </ReactFlowProvider>
        </div>
    );
}
