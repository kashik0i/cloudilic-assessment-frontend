import {useMemo, useState} from "react"
import {
    Search as SearchIcon,
    DownloadCloud,
    Workflow,
    Hand,
    Blocks,
    Mail,
    FolderTree,
    FileInput,
    FileOutput,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "@/components/ui/sidebar"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Separator} from "@/components/ui/separator"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {BlockCard} from "@/components/app-sidebar/block-card.tsx";
import type {Section} from "@/interfaces.ts";


const sections: Section[] = [
    {
        key: "fetch",
        label: "Fetch data",
        icon: DownloadCloud,
        categories: [
            {
                title: "I/O Nodes",
                seeAllHref: "#io",
                items: [
                    {type: "inputNode", label: "Input", icon: FileInput, data: {label: "Input"}},
                    {type: "outputNode", label: "Output", icon: FileOutput, data: {label: "Output"}},
                ],
            },
            {
                title: "Knowledge Bases",
                seeAllHref: "#kbs",
                items: [
                    {type: "ragNode", label: "RAG", icon: FolderTree, data: {source: "rag"}},
                ],
            },
        ],
    },
    {
        key: "process",
        label: "Process",
        icon: Workflow,
        categories: [
            {
                title: "Transform",
                seeAllHref: "#transform",
                items: [
                    {type: "clean", label: "Clean text", icon: Workflow, data: {action: "clean"}},
                    {type: "chunk", label: "Chunk", icon: Workflow, data: {action: "chunk"}},
                ],
            },
        ],
    },
    {
        key: "actions",
        label: "Actions",
        icon: Hand,
        categories: [
            {
                title: "Send",
                seeAllHref: "#send",
                items: [{type: "send-email", label: "Email", icon: Mail, data: {action: "email"}}],
            },
        ],
    },
    {
        key: "templates",
        label: "Templates",
        icon: Blocks,
        categories: [
            {
                title: "Starter flows",
                seeAllHref: "#templates",
                items: [
                    {type: "kb-ingest", label: "KB Ingest", icon: Blocks},
                    {type: "email-sync", label: "Email Sync", icon: Blocks},
                ],
            },
        ],
    },
]


export function AppSidebar() {
    const [activeSection, setActiveSection] = useState<Section["key"]>("fetch")
    const [q, setQ] = useState("")

    const section = useMemo(
        () => sections.find((s) => s.key === activeSection)!,
        [activeSection]
    )

    const filteredCategories = useMemo(() => {
        if (!q.trim()) return section.categories
        const term = q.toLowerCase()
        return section.categories
            .map((cat) => ({
                ...cat,
                items: cat.items.filter(
                    (b) =>
                        b.label.toLowerCase().includes(term) || b.type.toLowerCase().includes(term)
                ),
            }))
            .filter((cat) => cat.items.length > 0)
    }, [q, section])

    return (
        <Sidebar className="w-[25%]" collapsible="icon">
            <SidebarContent>
                {/* All other content hidden when collapsed */}
                <div className="group-data-[collapsible=icon]:hidden">
                    <SidebarGroup>
                        <SidebarGroupLabel className="px-4 py-4 h-[10vh] w-full">
                            <div className="flex items-center justify-between w-full">
                                <img src="/dragify.webp" alt="App Logo"/>
                            </div>
                            <div className="flex items-center justify-center py-4">
                                {/*<SidebarTrigger className="h-8 w-8"/>*/}
                            </div>
                        </SidebarGroupLabel>
                        <SidebarGroupContent className="px-3 pb-3">
                            <div className="relative">
                                <SearchIcon
                                    className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"/>
                                <Input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search blocks..."
                                    className="pl-8"
                                />
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupContent className="px-2 py-2">
                            <div className="flex gap-3">
                                <TooltipProvider delayDuration={200}>
                                    <nav
                                        aria-label="Block sections"
                                        className="flex flex-col items-center gap-2 rounded-md"
                                    >
                                        {sections.map((s) => {
                                            const ActiveIcon = s.icon
                                            const isActive = s.key === activeSection
                                            return (
                                                <div
                                                    key={s.key}
                                                    className="flex flex-col items-center justify-center gap-1"
                                                >
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant={isActive ? "default" : "ghost"}
                                                                size="icon"
                                                                onClick={() => setActiveSection(s.key)}
                                                                aria-pressed={isActive}
                                                                aria-label={s.label}
                                                            >
                                                                <ActiveIcon className="h-4 w-4"/>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right">
                                                            {s.label}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            )
                                        })}
                                    </nav>
                                </TooltipProvider>

                                <ScrollArea className="flex-1 pr-1">
                                    <div className="flex flex-col gap-5">
                                        {filteredCategories.map((cat) => (
                                            <section key={cat.title} className="min-w-0">
                                                <header className="mb-2 flex items-center justify-between">
                                                    <h3 className="text-sm font-semibold text-zinc-800">
                                                        {cat.title}
                                                    </h3>
                                                    {cat.seeAllHref && (
                                                        <Button
                                                            asChild
                                                            variant="link"
                                                            className="h-auto p-0 text-xs text-zinc-600"
                                                        >
                                                            <a href={cat.seeAllHref}>See all</a>
                                                        </Button>
                                                    )}
                                                </header>
                                                <Separator className="mb-2"/>
                                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                    {cat.items.map((b) => (
                                                        <BlockCard
                                                            key={`${cat.title}-${b.type}`}
                                                            block={b}
                                                            compact={false}
                                                        />
                                                    ))}
                                                </div>
                                            </section>
                                        ))}

                                        {filteredCategories.length === 0 && (
                                            <p className="px-1 text-xs text-zinc-500">No results</p>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </div>
            </SidebarContent>
        </Sidebar>
    )
}
