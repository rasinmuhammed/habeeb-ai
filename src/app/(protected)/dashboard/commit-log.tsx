'use client'
import useProject from "@/hooks/use-project"
import React from "react"
import { api } from "@/trpc/react"
import { ExternalLink, GitCommit, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const CommitLog = () => {
    const { projectId, project } = useProject()

    const { data: commits, isLoading, error } = api.project.getCommits.useQuery(
        { projectId },
        { enabled: !!projectId && projectId.trim() !== '' }
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Loading commits...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-8 text-center">
                <p className="text-red-500 dark:text-red-400">Error: {error.message}</p>
            </div>
        );
    }

    if (!commits || commits.length === 0) {
        return (
            <div className="py-8 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <GitCommit className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No commits yet.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Commits will appear here once you push to the repository.</p>
            </div>
        );
    }

    return (
        <ul className="space-y-6">
            {commits.map((commit, commitIdx) => (
                <li key={commit.id} className="relative flex gap-x-4">
                    <div className={cn(
                        commitIdx === commits.length - 1 ? 'h-0' : '-bottom-6',
                        'absolute left-0 top-0 flex w-6 justify-center'
                    )}>
                        <div className="w-px translate-x-1 bg-gray-200 dark:bg-gray-700"></div>
                    </div>

                    <>
                        <img
                            src={commit.commitAuthorAvatar}
                            alt='commit avatar'
                            className="relative mt-4 size-8 flex-none rounded-full bg-gray-50 dark:bg-gray-800"
                        />
                        <div className="flex-auto rounded-xl bg-gray-50 dark:bg-gray-800 p-4 ring-1 ring-inset ring-gray-200 dark:ring-gray-700">
                            <div className="flex justify-between gap-x-4">
                                <Link
                                    target='_blank'
                                    href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                                    className='py-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors'
                                >
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {commit.commitAuthorName}
                                    </span>{" "}
                                    <span className="inline-flex items-center">
                                        committed
                                        <ExternalLink className="ml-1 size-3" />
                                    </span>
                                </Link>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white mt-1">
                                {commit.commitMessage}
                            </p>
                            {commit.summary && (
                                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                    {commit.summary}
                                </p>
                            )}
                        </div>
                    </>
                </li>
            ))}
        </ul>
    )
}

export default CommitLog
