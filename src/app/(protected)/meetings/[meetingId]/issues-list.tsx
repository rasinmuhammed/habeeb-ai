'use client'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api, RouterOutputs } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
    VideoIcon, ArrowLeft, Clock, Code2, MessageSquare,
    FileCode, ChevronDown, ChevronUp, Loader2, Sparkles, LinkIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Issue = NonNullable<RouterOutputs['project']['getMeetingById']>['issues'][number]

type RelatedFile = {
    fileName: string
    summary: string
    relevanceExplanation: string
    score: number
}

function getRelatedFiles(raw: unknown): RelatedFile[] {
    if (!Array.isArray(raw)) return []
    return raw.filter((f): f is RelatedFile =>
        typeof f === 'object' && f !== null && typeof (f as RelatedFile).fileName === 'string'
    )
}

function IssueCard({ issue, index }: { issue: Issue; index: number }) {
    const [sheetOpen, setSheetOpen] = React.useState(false)
    const [codeExpanded, setCodeExpanded] = React.useState(false)
    const router = useRouter()

    const relatedFiles = getRelatedFiles(issue.relatedFiles)
    const isLinking = issue.relatedFiles === null
    const hasCode = relatedFiles.length > 0

    const handleAskAbout = (context: string) => {
        const prefill = encodeURIComponent(context)
        router.push(`/dashboard?prefill=${prefill}`)
    }

    return (
        <>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-[560px] overflow-y-auto bg-white">
                    <SheetHeader className="pb-0">
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="font-mono text-xs text-gray-500 border-gray-200">
                                <Clock className="h-3 w-3 mr-1" />
                                {issue.start} – {issue.end}
                            </Badge>
                        </div>
                        <SheetTitle className="text-xl font-bold leading-tight text-gray-900">
                            {issue.gist}
                        </SheetTitle>
                        <p className="text-sm text-gray-500 mt-1 font-normal">{issue.headline}</p>
                    </SheetHeader>

                    <div className="mt-6 space-y-6">
                        <blockquote className="border-l-4 border-violet-400 pl-4 bg-violet-50 py-3 rounded-r-xl">
                            <p className="text-sm text-gray-700 italic leading-relaxed">{issue.summary}</p>
                        </blockquote>

                        {isLinking && (
                            <div className="flex items-center gap-2.5 text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
                                <Loader2 className="h-4 w-4 animate-spin text-violet-400 shrink-0" />
                                Linking relevant code files...
                            </div>
                        )}

                        {hasCode && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                        <Code2 className="h-3 w-3 text-white" />
                                    </div>
                                    Code Context
                                    <span className="text-xs text-gray-400 font-normal">
                                        — {relatedFiles.length} {relatedFiles.length === 1 ? 'file' : 'files'} linked
                                    </span>
                                </h4>
                                <div className="space-y-3">
                                    {relatedFiles.map((file) => (
                                        <div
                                            key={file.fileName}
                                            className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-violet-200 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileCode className="h-4 w-4 text-violet-400 shrink-0" />
                                                <span className="text-xs font-mono text-gray-800 font-semibold truncate">
                                                    {file.fileName}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                                {file.relevanceExplanation}
                                            </p>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 px-2 -ml-1"
                                                onClick={() => handleAskAbout(
                                                    `${issue.gist}: Tell me about ${file.fileName} in relation to "${issue.headline}"`
                                                )}
                                            >
                                                <MessageSquare className="h-3 w-3 mr-1.5" />
                                                Ask HabeebAI
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isLinking && !hasCode && (
                            <div className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 shrink-0" />
                                No code files linked to this issue
                            </div>
                        )}

                        <div className="pt-2">
                            <Button
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl h-10"
                                onClick={() => handleAskAbout(`Tell me about: "${issue.gist}" — ${issue.headline}`)}
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                                Ask HabeebAI about this issue
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
                <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />

                <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <Badge
                            variant="outline"
                            className="font-mono text-xs text-gray-400 border-gray-100 bg-gray-50 gap-1"
                        >
                            <Clock className="h-2.5 w-2.5" />
                            {issue.start} – {issue.end}
                        </Badge>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1.5">
                        {issue.gist}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
                        {issue.headline}
                    </p>

                    {/* Code context toggle */}
                    <div className="mt-4">
                        {isLinking && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Linking code...
                            </div>
                        )}

                        {hasCode && (
                            <>
                                <button
                                    onClick={() => setCodeExpanded(v => !v)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
                                >
                                    <Code2 className="h-3.5 w-3.5" />
                                    {relatedFiles.length} related {relatedFiles.length === 1 ? 'file' : 'files'}
                                    {codeExpanded
                                        ? <ChevronUp className="h-3 w-3" />
                                        : <ChevronDown className="h-3 w-3" />
                                    }
                                </button>

                                <AnimatePresence>
                                    {codeExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="mt-3 space-y-2 overflow-hidden"
                                        >
                                            {relatedFiles.map((file) => (
                                                <div
                                                    key={file.fileName}
                                                    className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100"
                                                >
                                                    <FileCode className="h-3.5 w-3.5 text-violet-400 mt-0.5 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-mono text-gray-800 font-medium truncate">
                                                            {file.fileName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                            {file.relevanceExplanation}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}

                        {!isLinking && !hasCode && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                <Code2 className="h-3 w-3" />
                                No code context
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSheetOpen(true)}
                            className="flex-1 h-8 text-xs border-gray-200 hover:border-violet-200 hover:text-violet-600"
                        >
                            View Details
                        </Button>
                        {hasCode && (
                            <Button
                                size="sm"
                                className="h-8 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-sm shadow-violet-500/20"
                                onClick={() => handleAskAbout(`Tell me about the code related to: "${issue.gist}"`)}
                            >
                                <MessageSquare className="h-3 w-3 mr-1.5" />
                                Ask
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    )
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-8 bg-gray-200 rounded w-80" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-52" />
                    ))}
                </div>
            </div>
        </div>
    )
}

const IssuesList = ({ meetingId }: { meetingId: string }) => {
    const { data: meeting, isLoading } = api.project.getMeetingById.useQuery(
        { meetingId },
        {
            refetchInterval: (query) => {
                const data = query.state.data
                if (!data || data.status !== 'COMPLETED') return 4000
                const allLinked = data.issues.length === 0 ||
                    data.issues.every(i => i.relatedFiles !== null)
                return allLinked ? false : 8000
            }
        }
    )

    if (isLoading) return <LoadingSkeleton />
    if (!meeting) return null

    const linkedCount = meeting.issues.filter(i => i.relatedFiles !== null && Array.isArray(i.relatedFiles) && (i.relatedFiles as RelatedFile[]).length > 0).length

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="p-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/meetings"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-5 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                        All Meetings
                    </Link>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
                            <VideoIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{meeting.name}</h1>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className="text-sm text-gray-400">
                                    {meeting.createdAt.toLocaleDateString('en-US', {
                                        month: 'long', day: 'numeric', year: 'numeric'
                                    })}
                                </span>
                                {meeting.status === 'COMPLETED' && meeting.issues.length > 0 && (
                                    <Badge className="bg-violet-100 text-violet-700 border-0 text-xs gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        {meeting.issues.length} issues extracted
                                    </Badge>
                                )}
                                {linkedCount > 0 && (
                                    <Badge className="bg-green-50 text-green-700 border-green-100 text-xs gap-1">
                                        <Code2 className="h-3 w-3" />
                                        {linkedCount} linked to code
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Issues */}
                {meeting.issues.length === 0 ? (
                    <div className="text-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto mb-3" />
                        <p className="text-gray-500">Processing meeting audio...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {meeting.issues.map((issue, i) => (
                            <IssueCard key={issue.id} issue={issue} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default IssuesList
