'use client'
import { useUser } from '@clerk/nextjs'
import useProject from '@/hooks/use-project'
import { ExternalLink, Github, AlertCircle, Trash2, Sparkles, Zap, MessageSquare, Video, GitCommit } from 'lucide-react'
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
import { motion } from 'framer-motion'
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

// Premium animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
}

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
}

// Skeleton loader component
const CardSkeleton = () => (
    <div className='bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6'>
        <div className='animate-pulse space-y-4'>
            <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl'></div>
                <div className='space-y-2 flex-1'>
                    <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3'></div>
                    <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                </div>
            </div>
            <div className='h-24 bg-gray-200 dark:bg-gray-700 rounded-xl'></div>
        </div>
    </div>
)

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
            <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-6'>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className='text-center max-w-md'
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className='inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25 mb-6'
                    >
                        <Sparkles className='w-10 h-10 text-white' />
                    </motion.div>
                    <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>No Project Selected</h2>
                    <p className='text-gray-600 dark:text-gray-400 mb-8'>Get started by creating your first project and connecting a GitHub repository.</p>
                    <Link href='/create'>
                        <Button size="lg" className='bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300'>
                            <Sparkles className='mr-2 h-5 w-5' />
                            Create Your First Project
                        </Button>
                    </Link>
                </motion.div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950'>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className='container mx-auto px-4 py-8 max-w-7xl'
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className='mb-8'>
                    <div className='flex items-center justify-between flex-wrap gap-4'>
                        <div>
                            <div className='flex items-center gap-3 mb-1'>
                                <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent'>
                                    {project?.name || 'Project Dashboard'}
                                </h1>
                                <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse'></span>
                                    Active
                                </span>
                            </div>
                            <p className='text-gray-600 dark:text-gray-400'>
                                Welcome back, <span className='font-medium text-violet-600 dark:text-violet-400'>{user?.firstName || 'Developer'}</span>! Ready to build something amazing? ✨
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            className="border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 transition-all"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </motion.div>

                {/* GitHub Repository Card */}
                <motion.div variants={itemVariants} className='mb-8'>
                    <div className='flex items-center justify-between flex-wrap gap-4'>
                        <div className='flex-1 min-w-[300px]'>
                            <motion.div
                                whileHover={{ scale: 1.01, y: -2 }}
                                transition={{ duration: 0.2 }}
                                className='rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_100%] animate-gradient-shift p-5 shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-shadow'
                            >
                                <div className='flex items-center'>
                                    <div className='w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0'>
                                        <Github className='size-6 text-white' />
                                    </div>
                                    <div className='ml-4 flex-1 min-w-0'>
                                        <p className='text-sm font-medium text-violet-100 mb-1'>
                                            Connected Repository
                                        </p>
                                        <Link
                                            href={project?.githubUrl ?? ""}
                                            className='inline-flex items-center text-white hover:text-violet-100 transition-colors group'
                                            target="_blank"
                                        >
                                            <span className='text-base font-semibold truncate'>
                                                {project?.githubUrl?.replace('https://github.com/', '') || 'Not connected'}
                                            </span>
                                            <ExternalLink className='ml-2 size-4 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform' />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className='flex items-center gap-3'>
                            <TeamMembers />
                            <InviteButton />
                        </div>
                    </div>
                </motion.div>

                {/* Main Feature Cards */}
                <motion.div variants={itemVariants} className='mb-8'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        <Suspense fallback={<CardSkeleton />}>
                            <motion.div
                                variants={cardVariants}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            >
                                <AskQuestionCard />
                            </motion.div>
                        </Suspense>
                        <Suspense fallback={<CardSkeleton />}>
                            <motion.div
                                variants={cardVariants}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            >
                                <MeetingCard />
                            </motion.div>
                        </Suspense>
                    </div>
                </motion.div>

                {/* Activity Section */}
                <motion.div
                    variants={itemVariants}
                    className='bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden'
                >
                    <div className='flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800'>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center'>
                                <GitCommit className='h-5 w-5 text-white' />
                            </div>
                            <div>
                                <h2 className='text-lg font-bold text-gray-900 dark:text-white'>Recent Activity</h2>
                                <p className='text-sm text-gray-500 dark:text-gray-400'>Latest commits and changes</p>
                            </div>
                        </div>
                    </div>
                    <div className='p-6'>
                        <CommitLog />
                    </div>
                </motion.div>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className='rounded-2xl'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <div className='w-10 h-10 rounded-full bg-red-100 flex items-center justify-center'>
                                <Trash2 className="h-5 w-5" />
                            </div>
                            Delete Project?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="pt-2 text-gray-600">
                            Are you sure you want to delete <strong className='text-gray-900'>{project?.name}</strong>?
                            <br /><br />
                            This action cannot be undone. All data including Q&A history, meetings, and commit analyses will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='rounded-xl'>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProject}
                            disabled={archiveProject.isPending}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
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