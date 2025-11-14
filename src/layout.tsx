import {SidebarProvider} from "@/components/ui/sidebar"
import {ThemeProvider} from "@/components/theme-provider.tsx";
import {AppSidebar} from "@/components/app-sidebar/app-sidebar.tsx";

export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <SidebarProvider>
                <div className="flex h-screen w-screen bg-white dark:bg-black text-black dark:text-white">
                    <AppSidebar/>
                    {children}
                </div>
            </SidebarProvider>

        </ThemeProvider>
    )
}
