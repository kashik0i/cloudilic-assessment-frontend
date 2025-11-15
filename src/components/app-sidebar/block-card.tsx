// BlockCard.tsx
import {Card, CardContent} from "@/components/ui/card"
import type {BlockDef} from "@/interfaces"

function onDragStart(
    event: React.DragEvent,
    nodeType: string,
    data?: Record<string, unknown>
) {
    const payload = { type: nodeType, data: data ?? {} }
    event.dataTransfer.setData("application/reactflow", JSON.stringify(payload))
    event.dataTransfer.effectAllowed = "move"
}

export function BlockCard({ block, compact }: { block: BlockDef; compact?: boolean }) {
    const Icon = block.icon
    return (
        <Card
            draggable
            onDragStart={(e) => onDragStart(e, block.type, block.data)}
            role="button"
            tabIndex={0}
            aria-label={`Drag ${block.label}`}
            className={[
                "cursor-grab active:cursor-grabbing select-none",
                compact ? "w-10 h-10" : "w-24 h-20",
            ].join(" ")}
        >
            <CardContent className="flex h-full w-full flex-col items-center justify-center p-2">
                <Icon className="h-5 w-5 text-zinc-700" aria-hidden="true" />
                {!compact && (
                    <span className="mt-1 text-xs text-zinc-700">{block.label}</span>
                )}
            </CardContent>
        </Card>
    )
}
