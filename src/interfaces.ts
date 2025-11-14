import type {ComponentType, SVGProps} from "react"
import type {LucideIcon} from "lucide-react"

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

