'use client'

import React from 'react'
import Link from 'next/link'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import {
    GitCommit, Video, MessageSquare, Code2,
    History, Loader2, Filter
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

// ─── Types ───────────────────────────────────────────────────────────────────

type TimelineEvent = ReturnType<typeof useTimeline>[number]

function useTimeline() {
    const { projectId } = useProject()
    const { data } = api.project.getTimeline.useQuery({ projectId }, { enabled: !!projectId })
    return data ?? []
}

type FilterType = 'all' | 'commit' | 'meeting' | 'qa'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupByMonth(events: TimelineEvent[]) {
    const groups = new Map<string, TimelineEvent[]>()
    for (const event of events) {
        const key = new Date(event.date).toLocaleDateString('en-US', {
            month: 'long', year: 'numeric'
        })
        const existing = groups.get(key) ?? []
        existing.push(event)
        groups.set(key, existing)
    }
    return groups
}

function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
    })
}

// ─── Event Cards ─────────────────────────────────────────────────────────────

function CommitEvent({ event }: { event: Extract<TimelineEvent, { type: 'commit' }> }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center shrink-0 z-10">
                    <GitCommit className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div className="w-px flex-1 bg-gray-100 mt-1" />
            </div>
            <div className="pb-6 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-mono bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                        {event.hash.slice(0, 7)}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(event.date)}</span>
                    {event.author && (
                        <span className="text-xs text-gray-400">by {event.author}</span>
                    )}
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug mb-1">
                    {event.message}
                </p>
                {event.summary && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {event.summary}
                    </p>
                )}
            </div>
        </div>
    )
}

function MeetingEvent({ event }: { event: Extract<TimelineEvent, { type: 'meeting' }> }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center shrink-0 z-10">
                    <Video className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <div className="w-px flex-1 bg-gray-100 mt-1" />
            </div>
            <div className="pb-6 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs text-gray-400">{formatDate(event.date)}</span>
                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs h-5 px-1.5 font-normal">
                        Meeting
                    </Badge>
                    {event.status === 'PROCESSING' && (
                        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs h-5 px-1.5 gap-1 font-normal">
                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            Processing
                        </Badge>
                    )}
                </div>
                <Link href={`/meetings/${event.id}`} className="group">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors leading-snug mb-2">
                        {event.name}
                    </p>
                </Link>
                <div className="flex items-center gap-2 flex-wrap">
                    {event.issueCount > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {event.issueCount} {event.issueCount === 1 ? 'issue' : 'issues'} extracted
                        </span>
                    )}
                    {event.linkedCount > 0 && (
                        <span className="text-xs text-violet-600 flex items-center gap-1 font-medium">
                            <Code2 className="h-3 w-3" />
                            {event.linkedCount} linked to code
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

function QAEvent({ event }: { event: Extract<TimelineEvent, { type: 'qa' }> }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-violet-100 border-2 border-violet-300 flex items-center justify-center shrink-0 z-10">
                    <MessageSquare className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <div className="w-px flex-1 bg-gray-100 mt-1" />
            </div>
            <div className="pb-6 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs text-gray-400">{formatDate(event.date)}</span>
                    <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-xs h-5 px-1.5 font-normal">
                        Q&A
                    </Badge>
                    {event.userName && (
                        <span className="text-xs text-gray-400">by {event.userName}</span>
                    )}
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug mb-1.5">
                    "{event.question}"
                </p>
                {event.answer && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {event.answer}
                    </p>
                )}
                {event.fileCount > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                        <Code2 className="h-3 w-3" />
                        {event.fileCount} {event.fileCount === 1 ? 'file' : 'files'} analyzed
                    </div>
                )}
            </div>
        </div>
    )
}

function TimelineEventItem({ event }: { event: TimelineEvent }) {
    if (event.type === 'commit') return <CommitEvent event={event} />
    if (event.type === 'meeting') return <MeetingEvent event={event} />
    return <QAEvent event={event} />
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const filters: { value: FilterType; label: string; icon: React.ElementType; color: string }[] = [
    { value: 'all',     label: 'All',     icon: History,        color: 'text-gray-600' },
    { value: 'commit',  label: 'Commits', icon: GitCommit,      color: 'text-amber-600' },
    { value: 'meeting', label: 'Meetings',icon: Video,          color: 'text-purple-600' },
    { value: 'qa',      label: 'Q&A',     icon: MessageSquare,  color: 'text-violet-600' },
]

function FilterBar({ active, onChange, counts }: {
    active: FilterType
    onChange: (f: FilterType) => void
    counts: Record<FilterType, number>
}) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            {filters.map(f => (
                <button
                    key={f.value}
                    onClick={() => onChange(f.value)}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                        active === f.value
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                >
                    <f.icon className={cn('h-3.5 w-3.5', active === f.value ? 'text-white' : f.color)} />
                    {f.label}
                    {counts[f.value] > 0 && (
                        <span className={cn(
                            'text-xs px-1.5 py-0.5 rounded-full',
                            active === f.value
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-100 text-gray-500'
                        )}>
                            {counts[f.value]}
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TimelinePage() {
    const { project } = useProject()
    const events = useTimeline()
    const [filter, setFilter] = React.useState<FilterType>('all')

    const filtered = filter === 'all' ? events : events.filter(e => e.type === filter)
    const grouped = groupByMonth(filtered)

    const counts: Record<FilterType, number> = {
        all: events.length,
        commit: events.filter(e => e.type === 'commit').length,
        meeting: events.filter(e => e.type === 'meeting').length,
        qa: events.filter(e => e.type === 'qa').length,
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-3xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-600 rounded-xl flex items-center justify-center shadow-sm">
                            <History className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Codebase Timeline</h1>
                            <p className="text-sm text-gray-500">
                                {project?.name
                                    ? `The story of ${project.name}`
                                    : 'Every commit, meeting, and decision that shaped this codebase'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="mb-8 sticky top-4 z-10">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-3 shadow-sm">
                        <FilterBar active={filter} onChange={setFilter} counts={counts} />
                    </div>
                </div>

                {/* Empty state */}
                {events.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <History className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No history yet</h3>
                        <p className="text-gray-500 text-sm">
                            Start by indexing a repository or uploading a meeting recording.
                        </p>
                    </div>
                )}

                {filtered.length === 0 && events.length > 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-sm">No {filter} events yet.</p>
                    </div>
                )}

                {/* Timeline */}
                {[...grouped.entries()].map(([month, monthEvents], groupIdx) => (
                    <motion.div
                        key={month}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: groupIdx * 0.05 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {month}
                            </h2>
                            <div className="flex-1 h-px bg-gray-100" />
                            <span className="text-xs text-gray-300">
                                {monthEvents.length} {monthEvents.length === 1 ? 'event' : 'events'}
                            </span>
                        </div>

                        <div>
                            {monthEvents.map((event, i) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.25, delay: groupIdx * 0.05 + i * 0.03 }}
                                >
                                    <TimelineEventItem event={event} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {events.length > 0 && (
                    <div className="flex items-center gap-3 py-4">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-300">
                            {counts.all} total events
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>
                )}
            </div>
        </div>
    )
}
