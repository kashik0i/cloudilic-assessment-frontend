import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

import {
    BaseNode,
    BaseNodeContent,
    BaseNodeHeader,
    BaseNodeHeaderTitle,
} from "./base-node";
import type { FlowNodeData, FlowNodeType } from "@/interfaces.ts";

type AppNode = Node<FlowNodeData, FlowNodeType>;

export function OutputNode({ data }: NodeProps<AppNode>) {
    const isLoading = (data as any)?.isLoading || false;
    const error = (data as any)?.error;
    const response = (data as any)?.response;

    return (
        <BaseNode
            aria-label="Output node"
            aria-describedby={`output-node-desc`}
        >
            <BaseNodeHeader>
                <BaseNodeHeaderTitle>Output</BaseNodeHeaderTitle>
            </BaseNodeHeader>
            <BaseNodeContent>
                <div
                    id="output-node-desc"
                    className="text-muted-foreground text-xs leading-relaxed mb-2"
                >
                    Displays the final result of the flow.
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                            Processing your request...
                        </span>
                    </div>
                )}

                {/* Error State */}
                {!isLoading && error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                                Error
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Success State with Response */}
                {!isLoading && !error && response && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">Response received</span>
                        </div>
                        <div className="p-3 bg-muted rounded border text-sm whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                            {response}
                        </div>
                    </div>
                )}

                {/* Default/Empty State */}
                {!isLoading && !error && !response && (
                    <div className="p-3 bg-muted/50 rounded border border-dashed text-center">
                        <p className="text-xs text-muted-foreground">
                            No output yet. Run the flow to see results.
                        </p>
                    </div>
                )}
            </BaseNodeContent>
            {/* Output nodes usually receive connections, so expose a target handle on the left */}
            <Handle type="target" position={Position.Left} />
        </BaseNode>
    );
}
