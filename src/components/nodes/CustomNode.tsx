import type {NodeProps} from "@xyflow/react";

export default function CustomNode(props: NodeProps) {
    return (
        <div className="nowheel" style={{ overflow: 'auto' }}>
            <p>Scrollable content...</p>
        </div>
    );
}