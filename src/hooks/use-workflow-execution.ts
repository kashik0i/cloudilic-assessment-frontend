import { useCallback, useMemo, useRef } from "react";
import type { Edge, Node } from "@xyflow/react";
import { chat } from "@/services/api.ts";
import type { ChatPayload, FlowNodeData, FlowNodeType } from "@/interfaces.ts";

const SESSION_KEY = "workflow.sessionId";

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

  // Simple linear path resolver (expects Input -> optional RAG -> Output)
  const resolvePath = useCallback(() => {
    const order: string[] = [];
    // pick first input
    const inputId = idsByType.input[0];
    if (!inputId) return order;
    order.push(inputId);
    let nextId: string | undefined = edges.find(e => e.source === inputId)?.target;
    if (nextId && nodes.find(n => n.id === nextId)?.type === "ragNode") {
      order.push(nextId);
      nextId = edges.find(e => e.source === nextId!)?.target;
    }
    if (nextId && nodes.find(n => n.id === nextId)?.type === "outputNode") {
      order.push(nextId);
    }
    return order;
  }, [edges, idsByType.input, nodes]);

  const pathIds = resolvePath();
  const hasRag = pathIds.some(id => nodes.find(n => n.id === id)?.type === "ragNode");

  const validate = useCallback(() => {
    const errors: string[] = [];
    if (!idsByType.input.length) errors.push("Add an Input node.");
    if (!idsByType.output.length) errors.push("Add an Output node.");
    if (idsByType.rag.length > 1) errors.push("Only one RAG node is supported in MVP.");
    if (pathIds.length < 2) errors.push("Connect Input to Output (optionally via RAG).");
    return errors;
  }, [idsByType, pathIds.length]);

  const setOutputData = useCallback((patch: Partial<FlowNodeData>) => {
    setNodes(prev => prev.map(n => n.type === "outputNode" ? { ...n, data: { ...(n.data||{}), ...patch } } : n));
  }, [setNodes]);

  const run = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    const errs = validate();
    if (errs.length) {
      setOutputData({ isLoading: false, error: errs.join(" "), response: undefined });
      runningRef.current = false;
      return;
    }

    // Gather data
    const inputNode = nodes.find(n => n.type === "inputNode");
    const ragNode = nodes.find(n => n.type === "ragNode");
    const prompt = String((inputNode?.data as any)?.prompt || (inputNode?.data as any)?.label || "");
    if (!prompt.trim()) {
      setOutputData({ isLoading: false, error: "Please enter a question in the Input node", response: undefined });
      runningRef.current = false;
      return;
    }
    if (prompt.length > 4000) {
      setOutputData({ isLoading: false, error: "Prompt too long (>4000 chars)", response: undefined });
      runningRef.current = false;
      return;
    }
    const documentId = hasRag ? String((ragNode?.data as any)?.documentId || "") : undefined;

    setOutputData({ isLoading: true, error: undefined });

    // Session handling: prefer output node, then localStorage
    let sessionId = String((nodes.find(n => n.type === "outputNode")?.data as any)?.sessionId || "");
    if (!sessionId) sessionId = localStorage.getItem(SESSION_KEY) || "";

    const payload: ChatPayload = { prompt, sessionId: sessionId || undefined, documentId: documentId || undefined };

    try {
      const result = await chat(payload);
      const historyEntryUser = { role: "user" as const, content: prompt };
      const historyEntryAssistant = { role: "assistant" as const, content: result.answer };
      // persist session
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
  }, [validate, setOutputData, nodes, hasRag, setNodes]);

  return {
    run,
    hasRag,
    pathIds,
    idsByType,
  };
}
