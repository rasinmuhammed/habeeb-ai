'use client'

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarHeader, SidebarMenuItem, SidebarMenuButton, SidebarMenu, useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Bot, Presentation, CreditCard, Plus, Trash2, MoreVertical, History } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import useProject from "@/hooks/use-project"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import useRefetch from "@/hooks/use-refetch"

const items = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Q&A',
        url: '/qa',
        icon: Bot,
    },
    {
        title: 'Meetings',
        url: '/meetings',
        icon: Presentation,
    },
    {
        title: 'Timeline',
        url: '/timeline',
        icon: History,
    },
    {
        title: 'Billing',
        url: '/billing',
        icon: CreditCard,
    }
]

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { open } = useSidebar()
    const { projects, projectId, setProjectId } = useProject()
    const refetch = useRefetch()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null)

    const archiveProject = api.project.archiveProject.useMutation()

    const handleProjectClick = (id: string) => {
        setProjectId(id)
        router.push('/dashboard')
    }

    const handleDeleteClick = (e: React.MouseEvent, project: { id: string; name: string }) => {
        e.stopPropagation()
        setProjectToDelete(project)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = () => {
        if (!projectToDelete) return

        archiveProject.mutate({ projectId: projectToDelete.id }, {
            onSuccess: () => {
                toast.success('Project deleted successfully')
                setDeleteDialogOpen(false)
                setProjectToDelete(null)
                refetch()
                if (projectId === projectToDelete.id) {
                    router.push('/dashboard')
                }
            },
            onError: () => {
                toast.error('Failed to delete project')
            }
        })
    }

    return (
        <>
            <Sidebar collapsible="icon" variant="floating">
                <SidebarHeader>
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src='/logo.png'
                            alt='logo'
                            width={40}
                            height={40}
                            className="transition-transform group-hover:scale-110"
                        />
                        {open && (
                            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                HabeebAI
                            </h1>
                        )}
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-gray-500 dark:text-gray-400">
                            Application
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map(item => {
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <Link href={item.url} className={cn({
                                                    '!bg-gradient-to-r from-violet-600 to-indigo-600 !text-white': pathname === item.url
                                                }, 'list-none hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all group text-gray-700 dark:text-gray-300')}>
                                                    <item.icon className={cn(
                                                        "transition-transform group-hover:scale-110",
                                                        pathname === item.url && "text-white"
                                                    )} />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-gray-500 dark:text-gray-400">
                            Your Projects
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {projects?.map(project => {
                                    return (
                                        <SidebarMenuItem key={project.id}>
                                            <div className="flex items-center gap-2 w-full group">
                                                <SidebarMenuButton asChild className="flex-1">
                                                    <div
                                                        onClick={() => handleProjectClick(project.id)}
                                                        className="cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all rounded-lg"
                                                    >
                                                        <div className={cn(
                                                            'rounded-lg border size-8 flex items-center justify-center text-sm bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 font-semibold transition-all border-gray-200 dark:border-gray-700',
                                                            {
                                                                'bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-violet-600 scale-110': project.id === projectId
                                                            }
                                                        )}>
                                                            {project.name[0]?.toUpperCase()}
                                                        </div>
                                                        <span className={cn(
                                                            'font-medium transition-colors text-gray-700 dark:text-gray-300',
                                                            {
                                                                'text-violet-600 dark:text-violet-400': project.id === projectId
                                                            }
                                                        )}>{project.name}</span>
                                                    </div>
                                                </SidebarMenuButton>
                                                {open && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="dark:bg-gray-900 dark:border-gray-800">
                                                            <DropdownMenuItem
                                                                onClick={(e) => handleDeleteClick(e, project)}
                                                                className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/30 cursor-pointer"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete Project
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </SidebarMenuItem>
                                    )
                                })}
                                <div className="h-2"></div>
                                {open && (
                                    <SidebarMenuItem>
                                        <Link href='/create' className="w-full">
                                            <Button size='sm' variant={'outline'} className="w-full border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-gradient-to-r hover:from-violet-600 hover:to-indigo-600 hover:text-white hover:border-violet-600 transition-all group">
                                                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                                                Create Project
                                            </Button>
                                        </Link>
                                    </SidebarMenuItem>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Project?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="pt-2">
                            Are you sure you want to delete <strong>{projectToDelete?.name}</strong>?
                            <br /><br />
                            This action cannot be undone. All data including Q&A history, meetings, and commit analyses will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={archiveProject.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {archiveProject.isPending ? 'Deleting...' : 'Delete Project'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}