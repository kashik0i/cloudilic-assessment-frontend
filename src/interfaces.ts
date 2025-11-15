import type {ComponentType, SVGProps} from "react"
import type {LucideIcon} from "lucide-react"
import type {Node} from "@xyflow/react";
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

export interface FlowNodeData extends Node {
    label: string
    prompt?: string // For input nodes
    uploadedFile?: string // For RAG nodes
    documentId?: string // For RAG nodes
    response?: string // For output nodes
    isLoading?: boolean // For output nodes
    error?: string // For output nodes
    [key: string]: unknown
}

export type FlowNodeType = keyof typeof nodeTypes;
