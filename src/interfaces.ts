import type {ComponentType, SVGProps} from "react"
import type {LucideIcon} from "lucide-react"
import {nodeTypes} from "@/components/nodes";

export interface BlockDef {
    type: string
    label: string
    icon: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>
    data?: Record<string, unknown>
}
export type Category = {
    title: string
    items: BlockDef[]
    seeAllHref?: string
}

export type Section = {
    key: "fetch" | "process" | "actions" | "templates"
    label: string
    icon: LucideIcon
    categories: Category[]
}

// FlowNodeData now represents ONLY the custom data stored on a node's `data` property.
// It no longer extends the React Flow `Node` type to avoid circular / overly broad typing.
export interface FlowNodeData {
    label: string
    // Input node
    prompt?: string
    // RAG node
    uploadedFile?: string
    documentId?: string
    documentChunkCount?: number
    // Output node
    response?: string
    isLoading?: boolean
    error?: string
    retrievedCount?: number
    // Session + chat history (global to flow, stored on output node for display)
    sessionId?: string
    chatHistory?: { role: "user" | "assistant"; content: string }[]
    [key: string]: unknown
}

export type FlowNodeType = keyof typeof nodeTypes;

// Added: Health status interface for backend health checker.
export type HealthState = "up" | "down" | "degraded";
export interface HealthStatus {
    status: HealthState;
    latencyMs?: number; // round-trip time
    lastChecked: Date;
    error?: string; // network / parsing errors
}

// API contracts used by services/api
export type ChatPayload = {
    prompt: string
    documentId?: string
    sessionId?: string
}
export type ChatResponse = {
    answer: string
    sessionId: string
    retrievedCount?: number
}

export type UploadPdfResponse = {
    documentId: string
    chunkCount?: number
}

export const DEFAULT_INTERVAL = 20_000; // 20s polling
export const TIMEOUT_MS = 5_000; // abort if backend doesn't respond quickly
export const DEGRADED_LATENCY_MS = 1500; // threshold for degraded state