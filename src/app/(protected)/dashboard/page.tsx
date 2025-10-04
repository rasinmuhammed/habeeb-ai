'use client'
import { useUser } from '@clerk/nextjs'
import useProject from '@/hooks/use-project'
import { ExternalLink, Github, AlertCircle, Trash2, Archive, UserPlus } from 'lucide-react'
import Link from 'next/link'
import CommitLog from './commit-log'
import AskQuestionCard from './ask-question-card'
import MeetingCard from './meeting-card'
const InviteButton = dynamic(() => import('./invite-button'), { ssr: false });
import TeamMembers from './team-members'
import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'
import { useRouter } from 'next/navigation'
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

const DashboardPage = () => {
    const { project } = useProject()
    const { user } = useUser()
    const router = useRouter()
    const refetch = useRefetch()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    
    const archiveProject = api.project.archiveProject.useMutation()

    const handleDeleteProject = () => {
        if (!project?.id) return
        
        archiveProject.mutate({ projectId: project.id }, {
            onSuccess: () => {
                toast.success('Project deleted successfully')
                refetch()
                router.push('/dashboard')
                setShowDeleteDialog(false)
            },
            onError: () => {
                toast.error('Failed to delete project')
            }
        })
    }

    if (!project) {
        return (
            <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center'>
                <div className='text-center'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 mb-4'>
                        <AlertCircle className='w-8 h-8 text-violet-600' />
                    </div>
                    <h2 className='text-xl font-semibold text-gray-900 mb-2'>No Project Selected</h2>
                    <p className='text-gray-600 mb-6'>Please select or create a project to continue.</p>
                    <Link href='/create'>
                        <Button className='bg-gradient-to-r from-violet-600 to-indigo-600'>
                            Create New Project
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }
    
    return (
        <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
            <div className='container mx-auto px-4 py-8 max-w-7xl'>
                {/* Header Section */}
                <div className='mb-8'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
                                {project?.name || 'Project Dashboard'}
                            </h1>
                            <p className='text-gray-600 mt-1'>
                                Welcome back, {user?.firstName || 'Developer'}! 👋
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                        </Button>
                    </div>
                </div>

                {/* GitHub Link & Actions Bar */}
                <div className='flex items-center justify-between flex-wrap gap-4 mb-8'>
                    <div className='flex-1 min-w-[300px]'>
                        <div className='rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg hover:shadow-xl transition-all group'>
                            <div className='flex items-center'>
                                <div className='w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform'>
                                    <Github className='size-5 text-white'/>
                                </div>
                                <div className='ml-3 flex-1 min-w-0'>
                                    <p className='text-xs font-medium text-violet-100 mb-0.5'>
                                        Connected Repository
                                    </p>
                                    <Link 
                                        href={project?.githubUrl ?? ""} 
                                        className='inline-flex items-center text-white hover:text-violet-100 transition-colors group'
                                        target="_blank"
                                    >
                                        <span className='text-sm font-semibold truncate'>
                                            {project?.githubUrl?.replace('https://github.com/', '') || 'Not connected'}
                                        </span>
                                        <ExternalLink className='ml-1.5 size-3.5 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform'/>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex items-center gap-3'>
                        <TeamMembers/>
                        <InviteButton/>
                    </div>
                </div>

                {/* Main Cards Section */}
                <div className='mb-8'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        <Suspense fallback={
                            <div className='bg-white rounded-xl border shadow-sm p-6 animate-pulse'>
                                <div className='h-32 bg-gray-200 rounded'></div>
                            </div>
                        }>
                            <AskQuestionCard/>
                        </Suspense>
                        <Suspense fallback={
                            <div className='bg-white rounded-xl border shadow-sm p-6 animate-pulse'>
                                <div className='h-32 bg-gray-200 rounded'></div>
                            </div>
                        }>
                            <MeetingCard/>
                        </Suspense>
                    </div>
                </div>

                {/* Commit Log Section */}
                <div className='bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6 hover:border-violet-300 transition-all'>
                    <div className='flex items-center justify-between mb-6'>
                        <div>
                            <h2 className='text-xl font-bold text-gray-900'>Recent Activity</h2>
                            <p className='text-sm text-gray-600 mt-0.5'>Latest commits and changes</p>
                        </div>
                    </div>
                    <CommitLog/>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Project?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="pt-2">
                            Are you sure you want to delete <strong>{project?.name}</strong>? 
                            <br /><br />
                            This action cannot be undone. All data including Q&A history, meetings, and commit analyses will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProject}
                            disabled={archiveProject.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {archiveProject.isPending ? 'Deleting...' : 'Delete Project'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default DashboardPage