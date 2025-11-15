import type { NodeProps } from "@xyflow/react";
import { Handle, Position, useNodeId, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

import {
    BaseNode,
    BaseNodeContent,
    BaseNodeHeader,
    BaseNodeHeaderTitle,
} from "./base-node";
import type { FlowNodeData } from "@/interfaces.ts";

export function InputNode({ data }: NodeProps<FlowNodeData>) {
    const id = useNodeId();
    const { setNodes } = useReactFlow();

    const value = (typeof data?.label === "string" ? data.label : "");

    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const next = e.target.value;
            if (!id) return;
            // Update the node's data in React Flow so connected nodes can consume it.
            setNodes((nodes) =>
                nodes.map((n) =>
                    n.id === id
                        ? {
                              ...n,
                              data: {
                                  ...(n.data || {}),
                                  label: next,
                                  prompt: next, // also expose as `prompt` for clarity
                              },
                          }
                        : n
                )
            );
        },
        [id, setNodes]
    );

    return (
        <BaseNode aria-label="Input node" aria-describedby="input-node-desc">
            <BaseNodeHeader>
                <BaseNodeHeaderTitle>Input</BaseNodeHeaderTitle>
            </BaseNodeHeader>
            <BaseNodeContent>
                <div id="input-node-desc" className="text-muted-foreground text-xs leading-relaxed">
                    Enter your question or prompt. This value will be passed to connected nodes.
                </div>
                <div className="mt-1">
                    <textarea
                        value={value}
                        onChange={onChange}
                        placeholder="Type your question or prompt..."
                        rows={4}
                        className="w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label="Prompt input"
                    />
                </div>
            </BaseNodeContent>
            {/* Input node provides data to the flow, so expose a source handle on the right */}
            <Handle type="source" position={Position.Right} id="output" />
        </BaseNode>
    );
}
