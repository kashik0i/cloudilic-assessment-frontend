import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import {Loader2, AlertCircle, CheckCircle, MessageSquare, User, Bot} from "lucide-react";

import {
    BaseNode,
    BaseNodeContent,
    BaseNodeHeader,
    BaseNodeHeaderTitle,
} from "./base-node";
import type { FlowNodeData, FlowNodeType } from "@/interfaces.ts";
import { ScrollArea } from "@/components/ui/scroll-area";

type AppNode = Node<FlowNodeData, FlowNodeType>;

export function OutputNode({ data }: NodeProps<AppNode>) {
    const isLoading = (data as any)?.isLoading || false;
    const error = (data as any)?.error;
    const response = (data as any)?.response;
    const retrievedCount = (data as any)?.retrievedCount as number | undefined;
    const chatHistory = (data as any)?.chatHistory as { role: "user" | "assistant"; content: string }[] | undefined;

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

                {typeof retrievedCount === 'number' && (
                    <div className="mb-2 text-xs text-muted-foreground">
                        Retrieved <span className="font-medium">{retrievedCount}</span> chunks
                    </div>
                )}

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

                {/* Chat history (full execution history) */}
                {!isLoading && chatHistory && chatHistory.length > 0 && (
                    <div className="mb-3 rounded border bg-muted/30">
                        <div className="px-3 py-2 text-xs font-semibold text-foreground flex items-center justify-between border-b bg-muted/50">
                            <div className="flex items-center gap-1.5">
                                <MessageSquare className="h-4 w-4" />
                                <span>Execution History</span>
                            </div>
                            <span className="text-muted-foreground font-normal">
                                {chatHistory.length} message{chatHistory.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <ScrollArea
                            className="h-64 select-text nodrag nowheel cursor-text"
                            onPointerDownCapture={(e) => {
                                // prevent React Flow from starting a node drag while selecting text
                                e.stopPropagation();
                            }}
                            onMouseDownCapture={(e) => {
                                e.stopPropagation();
                            }}
                            data-no-drag={true}
                        >
                            <div className="p-3 space-y-2">
                                {chatHistory.map((m, i) => (
                                    <div
                                        key={i}
                                        className={`flex gap-2 p-2 rounded-md ${
                                            m.role === 'user' 
                                                ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800' 
                                                : 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                                        }`}
                                    >
                                        <div className="shrink-0 mt-0.5">
                                            {m.role === 'user' ? (
                                                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            ) : (
                                                <Bot className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-medium mb-1 ${
                                                m.role === 'user' 
                                                    ? 'text-blue-700 dark:text-blue-300' 
                                                    : 'text-green-700 dark:text-green-300'
                                            }`}>
                                                {m.role === 'user' ? 'You' : 'Assistant'}
                                            </div>
                                            <div className="text-xs break-words whitespace-pre-wrap text-foreground/90">
                                                {m.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {/* Success State with Response */}
                {!isLoading && !error && response && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">Response received</span>
                        </div>
                        <ScrollArea
                            className="h-96 border rounded bg-muted select-text nodrag nowheel cursor-text"
                            onPointerDownCapture={(e) => {
                                // prevent React Flow from starting a node drag while selecting/copying
                                e.stopPropagation();
                            }}
                            onMouseDownCapture={(e) => {
                                e.stopPropagation();
                            }}
                            data-no-drag={true}
                        >
                            <div className="p-3 text-sm whitespace-pre-wrap break-words" aria-label="Flow response output" role="log">
                                {response}
                            </div>
                        </ScrollArea>
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
