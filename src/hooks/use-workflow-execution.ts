import { useCallback, useMemo, useRef } from "react";
import type { Edge, Node } from "@xyflow/react";
import { chat } from "@/services/api.ts";
import type { ChatPayload, FlowNodeData, FlowNodeType } from "@/interfaces.ts";

const SESSION_KEY = "workflow.sessionId";

// Lightweight context passed through node executors
interface WorkflowContext {
  prompt?: string;
  documentId?: string;
  // room for future enrichment (retrieved passages, variables, etc.)
  [key: string]: unknown;
}

export function useWorkflowExecution(
  nodes: Node<FlowNodeData, FlowNodeType>[],
  setNodes: (updater: (prev: Node<FlowNodeData, FlowNodeType>[]) => Node<FlowNodeData, FlowNodeType>[]) => void,
  edges: Edge[],
) {
  const runningRef = useRef(false);

  const idsByType = useMemo(() => ({
    input: nodes.filter(n => n.type === "inputNode").map(n => n.id),
    rag: nodes.filter(n => n.type === "ragNode").map(n => n.id),
    output: nodes.filter(n => n.type === "outputNode").map(n => n.id),
  }), [nodes]);

  // General path resolver: BFS from each input to any output following directed edges.
  const findPath = useCallback((): string[] => {
    const outputsSet = new Set(idsByType.output);
    for (const start of idsByType.input) {
      const queue: string[] = [start];
      const visited = new Set<string>([start]);
      const parent: Record<string, string | undefined> = {};
      while (queue.length) {
        const current = queue.shift()!;
        // If current itself is an output AND not the start (avoid degenerate), we have a path.
        if (outputsSet.has(current) && current !== start) {
          const path: string[] = [];
          let cursor: string | undefined = current;
          while (cursor) {
            path.push(cursor);
            cursor = parent[cursor];
          }
          path.reverse();
          return path;
        }
        const targets = edges.filter(e => e.source === current).map(e => e.target);
        for (const t of targets) {
          if (visited.has(t)) continue;
          visited.add(t);
          parent[t] = current;
          // Early exit if target is output
          if (outputsSet.has(t)) {
            const path: string[] = [];
            let cursor: string | undefined = t;
            while (cursor) {
              path.push(cursor);
              cursor = parent[cursor];
            }
            path.reverse();
            return path;
          }
          queue.push(t);
        }
      }
    }
    return [];
  }, [edges, idsByType.input, idsByType.output]);

  const pathIds = useMemo(() => findPath(), [findPath]);
  const hasRag = pathIds.some(id => nodes.find(n => n.id === id)?.type === "ragNode");

  const validate = useCallback(() => {
    const errors: string[] = [];
    if (!idsByType.input.length) errors.push("Add an Input node.");
    if (!idsByType.output.length) errors.push("Add an Output node.");
    // Path requirement: at least input + output connected via edges
    if (pathIds.length < 2) errors.push("Connect an Input to an Output (intermediate nodes optional).");
    // (Optional) warn about multiple rag nodes (not blocking)
    if (idsByType.rag.length > 1) errors.push("Warning: multiple RAG nodes present; only first in path used.");
    return errors;
  }, [idsByType, pathIds.length]);

  const setOutputData = useCallback((patch: Partial<FlowNodeData>) => {
    setNodes(prev => prev.map(n => n.type === "outputNode" ? { ...n, data: { ...(n.data||{}), ...patch } } : n));
  }, [setNodes]);

  // Executor registry: node type -> function mutating workflow context.
  const executors: Record<string, (node: Node<FlowNodeData, FlowNodeType>, ctx: WorkflowContext) => Promise<void> | void> = {
    inputNode: (node, ctx) => {
      const prompt = String((node.data as any)?.prompt || (node.data as any)?.label || "");
      if (prompt.trim() && !ctx.prompt) ctx.prompt = prompt; // keep first prompt
    },
    ragNode: (node, ctx) => {
      const documentId = String((node.data as any)?.documentId || "");
      if (documentId) ctx.documentId = documentId; // override if later RAG encountered; policy can change
    },
    // outputNode does not enrich pre-chat; it's a sink
  };

  const run = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    // Refresh path in case of recent edits
    const activePath = findPath();

    const errs = validate();
    if (errs.filter(e => !e.startsWith("Warning")).length) { // blocking errors only
      setOutputData({ isLoading: false, error: errs.join(" "), response: undefined });
      runningRef.current = false;
      return;
    }

    // Build context by executing nodes along the path in order.
    const ctx: WorkflowContext = {};
    for (const id of activePath) {
      const node = nodes.find(n => n.id === id);
      if (!node) continue;
      const exec = executors[node.type];
      try {
        if (exec) await exec(node, ctx);
      } catch (e) {
        setOutputData({ isLoading: false, error: `Node execution failed (${node.type}): ${e instanceof Error ? e.message : String(e)}` });
        runningRef.current = false;
        return;
      }
    }

    // Require a prompt before proceeding
    const prompt = String(ctx.prompt || "");
    if (!prompt.trim()) {
      setOutputData({ isLoading: false, error: "Please enter a prompt in an Input node", response: undefined });
      runningRef.current = false;
      return;
    }
    if (prompt.length > 4000) {
      setOutputData({ isLoading: false, error: "Prompt too long (>4000 chars)", response: undefined });
      runningRef.current = false;
      return;
    }

    const documentId = hasRag ? String(ctx.documentId || "") : undefined;

    setOutputData({ isLoading: true, error: undefined });

    // Session handling: prefer output node, then localStorage
    let sessionId = String((nodes.find(n => n.type === "outputNode")?.data as any)?.sessionId || "");
    if (!sessionId) sessionId = localStorage.getItem(SESSION_KEY) || "";

    const payload: ChatPayload = { prompt, sessionId: sessionId || undefined, documentId: documentId || undefined };

    try {
      const result = await chat(payload);
      const historyEntryUser = { role: "user" as const, content: prompt };
      const historyEntryAssistant = { role: "assistant" as const, content: result.answer };
      localStorage.setItem(SESSION_KEY, result.sessionId);

      setNodes(prev => prev.map(n => {
        if (n.type === "outputNode") {
          const prior = (n.data?.chatHistory as any[]) || [];
          return {
            ...n,
            data: {
              ...(n.data||{}),
              isLoading: false,
              error: undefined,
              response: result.answer,
              sessionId: result.sessionId,
              retrievedCount: result.retrievedCount,
              chatHistory: [...prior, historyEntryUser, historyEntryAssistant],
            }
          }
        }
        return n;
      }));
    } catch (e) {
      setOutputData({ isLoading: false, error: e instanceof Error ? e.message : "Failed to process chat" });
    } finally {
      runningRef.current = false;
    }
  }, [findPath, hasRag, nodes, setNodes, setOutputData, validate]);

  return {
    run,
    hasRag,
    pathIds,
    idsByType,
  };
}
