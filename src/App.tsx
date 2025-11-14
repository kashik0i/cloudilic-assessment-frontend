import {useCallback} from 'react';
import {
    ReactFlow,
    addEdge,
    Background,
    Controls,
    useNodesState, useEdgesState,
    ReactFlowProvider, type Edge, type Node, type Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Layout from "@/layout.tsx";
import {useTheme} from "@/components/theme-provider.tsx";

const initialNodes: Node[] = [
    {id: 'n1', position: {x: 0, y: 0}, data: {label: 'Node 1'}, type: 'customNode',},
    {id: 'n2', position: {x: 0, y: 100}, data: {label: 'Node 2'}},
];
const initialEdges: Edge[] = [
    {id: 'n1-n2-2', source: 'n2', target: 'n1', animated: true}
];

function FlowCanvas() {
    const {theme} = useTheme();
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((els) => addEdge(params, els)),
        [setEdges],
    );

    return (
        <div style={{width: '100%', height: '100vh'}}>
            <ReactFlowProvider>
                <ReactFlow
                    colorMode={theme === 'system' ? 'dark' : theme}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Background/>
                    <Controls/>
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    );
}

export default function App() {
    return (
        <Layout>
            <FlowCanvas/>
        </Layout>
    );
}
