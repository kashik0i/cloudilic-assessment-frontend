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
import {useCallback} from "react";
import {nodeTypes} from "@/components/nodes";
import type {FlowNodeData, FlowNodeType} from "@/interfaces.ts";

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
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((els) => addEdge(params, els)),
        [setEdges]
    );

    return (
        <div style={{width: "100%", height: "100vh"}}>
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
            </ReactFlowProvider>
        </div>
    );
}
