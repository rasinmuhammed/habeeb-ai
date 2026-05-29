import { SidebarProvider } from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"
import React from "react"
import { AppSidebar } from "./dashboard/app-sidebar"
import { CommandPaletteProvider } from "@/components/command-palette"
import { CommandPaletteTrigger } from "@/components/command-palette-trigger"

type Props = {
    children: React.ReactNode
}

const SidebarLayout = ({ children }: Props) => {
    return (
        <CommandPaletteProvider>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
                    {/* Top Navigation Bar */}
                    <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b shadow-sm dark:border-gray-800">
                        <div className="flex items-center justify-between gap-4 px-6 py-3">
                            {/* Command Palette Trigger Hint */}
                            <CommandPaletteTrigger />
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 ring-2 ring-violet-100 hover:ring-violet-300 transition-all dark:ring-violet-900/50 dark:hover:ring-violet-700"
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="p-6">
                        <div className="max-w-[1600px] mx-auto">
                            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm min-h-[calc(100vh-10rem)] overflow-hidden">
                                <div className="overflow-y-auto h-[calc(100vh-10rem)]">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </SidebarProvider>
        </CommandPaletteProvider>
    )
}

export default SidebarLayout