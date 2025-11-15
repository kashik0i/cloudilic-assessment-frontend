import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position, useNodeId, useReactFlow } from "@xyflow/react";
import { useCallback, useMemo } from "react";

import {
    BaseNode,
    BaseNodeContent,
    BaseNodeHeader,
    BaseNodeHeaderTitle,
} from "./base-node";
import type { FlowNodeData, FlowNodeType } from "@/interfaces.ts";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

type AppNode = Node<FlowNodeData, FlowNodeType>;

export function InputNode({ data }: NodeProps<AppNode>) {
    const id = useNodeId();
    const { setNodes, getEdges } = useReactFlow();

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

    const hasDownstream = useMemo(() => {
        if (!id) return false;
        try {
            const edges = getEdges();
            return edges.some(e => e.source === id);
        } catch {
            return false;
        }
    }, [getEdges, id]);

    const canRun = (value?.trim()?.length ?? 0) > 0 && hasDownstream;

    const triggerRun = useCallback(() => {
        window.dispatchEvent(new CustomEvent("workflow/run"));
    }, []);

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
                <div className="mt-2 flex justify-end">
                    <Button size="sm" onClick={triggerRun} disabled={!canRun}>
                        <Play className="h-3.5 w-3.5" />
                        <span className="ml-1 text-xs">Run</span>
                    </Button>
                </div>
            </BaseNodeContent>
            <Handle type="source" position={Position.Right} id="output" />
        </BaseNode>
    );
}
