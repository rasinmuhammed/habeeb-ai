'use client'

import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { GitCommit, Video, MessageSquare, ChevronDown, ChevronUp, ScrollText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DecisionTrail } from '@/lib/decision-trail'

export function DecisionTrailView({ trail }: { trail: DecisionTrail }) {
    const [open, setOpen] = React.useState(false)
    const total = trail.commits.length + trail.meetings.length + trail.priorQA.length
    if (total === 0) return null

    return (
        <div className="mt-6">
            <div className="h-px bg-gray-100 mb-5" />

            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center justify-between w-full group"
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm shadow-amber-500/20">
                        <ScrollText className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">Decision Trail</p>
                        <p className="text-xs text-gray-400">
                            {total} {total === 1 ? 'event' : 'events'} shaped this code
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        {trail.commits.length > 0 && (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs h-5 px-1.5">
                                {trail.commits.length} commit{trail.commits.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                        {trail.meetings.length > 0 && (
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs h-5 px-1.5">
                                {trail.meetings.length} meeting{trail.meetings.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                        {trail.priorQA.length > 0 && (
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs h-5 px-1.5">
                                {trail.priorQA.length} Q&A
                            </Badge>
                        )}
                    </div>
                    {open
                        ? <ChevronUp className="h-4 w-4 text-gray-400" />
                        : <ChevronDown className="h-4 w-4 text-gray-400" />
                    }
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 space-y-4 overflow-hidden"
                    >
                        {trail.commits.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <GitCommit className="h-3.5 w-3.5 text-amber-500" />
                                    Commits
                                </p>
                                <div className="space-y-2">
                                    {trail.commits.map(c => (
                                        <div
                                            key={c.hash}
                                            className="flex items-start gap-3 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                                        {c.hash.slice(0, 7)}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(c.date).toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-800 font-medium leading-snug">{c.message}</p>
                                                {c.summary && (
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.summary}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {trail.meetings.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Video className="h-3.5 w-3.5 text-purple-500" />
                                    Team Meetings
                                </p>
                                <div className="space-y-2">
                                    {trail.meetings.map(m => (
                                        <Link key={m.meetingId} href={`/meetings/${m.meetingId}`}>
                                            <div className="flex items-start gap-3 bg-purple-50 rounded-xl px-4 py-3 border border-purple-100 hover:border-purple-300 hover:bg-purple-100 transition-colors cursor-pointer group">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-xs font-medium text-purple-700 group-hover:text-purple-800">
                                                            {m.meetingName}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(m.date).toLocaleDateString('en-US', {
                                                                month: 'short', day: 'numeric', year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 italic">"{m.issueGist}"</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {trail.priorQA.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                                    Prior Q&A
                                </p>
                                <div className="space-y-2">
                                    {trail.priorQA.map(q => (
                                        <div
                                            key={q.questionId}
                                            className="flex items-start gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm text-gray-800 font-medium leading-snug">
                                                    "{q.question}"
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {q.askedBy && (
                                                        <span className="text-xs text-gray-400">asked by {q.askedBy}</span>
                                                    )}
                                                    <span className="text-xs text-gray-300">
                                                        {new Date(q.date).toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
