import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position, useNodeId, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

import {
    BaseNode,
    BaseNodeContent,
    BaseNodeHeader,
    BaseNodeHeaderTitle,
} from "./base-node";
import type { FlowNodeData, FlowNodeType } from "@/interfaces.ts";

type AppNode = Node<FlowNodeData, FlowNodeType>;

export function InputNode({ data }: NodeProps<AppNode>) {
    const id = useNodeId();
    const { setNodes } = useReactFlow();

    const value = (typeof (data as any)?.label === "string" ? (data as any).label : "");

    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const next = e.target.value;
            if (!id) return;
            setNodes((nodes) =>
                nodes.map((n) =>
                    n.id === id
                        ? {
                              ...n,
                              data: {
                                  ...(n.data || {}),
                                  label: next,
                                  prompt: next,
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
            <Handle type="source" position={Position.Right} id="output" />
        </BaseNode>
    );
}
