'use client'
import { useUser } from '@clerk/nextjs'
import useProject from '@/hooks/use-project'
import { ExternalLink, Github, Users, Archive } from 'lucide-react'
import Link from 'next/link'
import CommitLog from './commit-log'
import AskQuestionCard from './ask-question-card'
import MeetingCard from './meeting-card'
import ArchiveButton from './archive-button'
const InviteButton = dynamic(() => import('./invite-button'), { ssr: false });
import TeamMembers from './team-members'
import dynamic from 'next/dynamic'

const DashboardPage = () => {
    const { project } = useProject()
    const { user } = useUser()
    
    return (
        <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
            <div className='container mx-auto px-4 py-8 max-w-7xl'>
                {/* Header Section */}
                <div className='mb-8'>
                    <div className='flex items-center justify-between mb-2'>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900'>
                                {project?.name || 'Project Dashboard'}
                            </h1>
                            <p className='text-gray-600 mt-1'>
                                Welcome back, {user?.firstName || 'Developer'}! 👋
                            </p>
                        </div>
                    </div>
                </div>

                {/* GitHub Link & Actions Bar */}
                <div className='flex items-center justify-between flex-wrap gap-4 mb-8'>
                    {/* Github Link */}
                    <div className='flex-1 min-w-[300px]'>
                        <div className='rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-lg hover:shadow-xl transition-shadow'>
                            <div className='flex items-center'>
                                <div className='w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0'>
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

                    {/* Action Buttons */}
                    <div className='flex items-center gap-3'>
                        <TeamMembers/>
                        <InviteButton/>
                        <ArchiveButton/>
                    </div>
                </div>

                {/* Main Cards Section */}
                <div className='mb-8'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        <AskQuestionCard/>
                        <MeetingCard/>
                    </div>
                </div>

                {/* Commit Log Section */}
                <div className='bg-white rounded-xl border shadow-sm p-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <div>
                            <h2 className='text-xl font-bold text-gray-900'>Recent Activity</h2>
                            <p className='text-sm text-gray-600 mt-0.5'>Latest commits and changes</p>
                        </div>
                    </div>
                    <CommitLog/>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage