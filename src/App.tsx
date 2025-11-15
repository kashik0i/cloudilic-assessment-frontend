import '@xyflow/react/dist/style.css';
import Layout from "@/layout.tsx";
import {FlowCanvas} from "@/components/flow-canvas.tsx";

export default function App() {
    return (
        <Layout>
            <FlowCanvas/>
        </Layout>
    );
}
