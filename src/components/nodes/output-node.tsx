import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

import {
    BaseNode,
    BaseNodeContent,
    BaseNodeHeader,
    BaseNodeHeaderTitle,
} from "./base-node";
import type { FlowNodeData } from "@/interfaces.ts";

export function OutputNode({ data }: NodeProps<FlowNodeData>) {
    // Defensive label resolution: fall back when data or data.label is missing/empty.
    const label =
        typeof data?.label === "string" && data.label.trim()
            ? data.label.trim()
            : "Output";

    return (
        <BaseNode
            aria-label="Output node"
            aria-describedby={`output-node-desc`}
        >
            <BaseNodeHeader>
                <BaseNodeHeaderTitle>Output</BaseNodeHeaderTitle>
            </BaseNodeHeader>
            <BaseNodeContent>
                {/* Primary label */}
                <div
                    className="text-sm font-medium break-words"
                    role="text"
                    title={label} // Allows full label visibility on hover for long text
                >
                    {label}
                </div>
                {/* Descriptive helper text */}
                <div
                    id="output-node-desc"
                    className="text-muted-foreground text-xs leading-relaxed"
                >
                    Displays the final result of the flow.
                </div>
            </BaseNodeContent>
            {/* Output nodes usually receive connections, so expose a target handle on the left */}
            <Handle type="target" position={Position.Left} />
        </BaseNode>
    );
}
