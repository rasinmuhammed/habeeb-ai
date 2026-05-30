'use client'

import React from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { generateOnboardingGuide, type GuideRole } from './action'
import { readStreamableValue } from 'ai/rsc'
import MDEditor from '@uiw/react-md-editor'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'
import {
    BookOpen, Server, Monitor, Layers, Settings2,
    Sparkles, Loader2, Save, Trash2, ChevronDown, ChevronUp,
    Clock, RotateCcw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Role selector ────────────────────────────────────────────────────────────

const roles: {
    value: GuideRole
    label: string
    description: string
    icon: React.ElementType
    color: string
    bg: string
}[] = [
    {
        value: 'backend',
        label: 'Backend',
        description: 'API routes, database, server-side logic',
        icon: Server,
        color: 'text-amber-600',
        bg: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    },
    {
        value: 'frontend',
        label: 'Frontend',
        description: 'UI components, pages, client-side logic',
        icon: Monitor,
        color: 'text-blue-600',
        bg: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    },
    {
        value: 'fullstack',
        label: 'Full-stack',
        description: 'End-to-end across the entire codebase',
        icon: Layers,
        color: 'text-violet-600',
        bg: 'bg-violet-50 border-violet-200 hover:border-violet-400',
    },
    {
        value: 'devops',
        label: 'DevOps',
        description: 'Deployment, CI/CD, infrastructure',
        icon: Settings2,
        color: 'text-green-600',
        bg: 'bg-green-50 border-green-200 hover:border-green-400',
    },
]

// ─── Saved guide card ─────────────────────────────────────────────────────────

function SavedGuideCard({
    guide,
    onDelete,
}: {
    guide: { id: string; role: string; createdAt: Date; content: string }
    onDelete: (id: string) => void
}) {
    const [expanded, setExpanded] = React.useState(false)
    const role = roles.find(r => r.value === guide.role)

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {role && (
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', role.bg)}>
                            <role.icon className={cn('h-4 w-4', role.color)} />
                        </div>
                    )}
                    <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">
                            {role?.label ?? guide.role} Engineer Guide
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {new Date(guide.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(guide.id) }}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {expanded
                        ? <ChevronUp className="h-4 w-4 text-gray-400" />
                        : <ChevronDown className="h-4 w-4 text-gray-400" />
                    }
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-gray-100"
                    >
                        <div className="px-5 py-5" data-color-mode="light">
                            <MDEditor.Markdown source={guide.content} className="prose prose-sm max-w-none" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
    const { project, projectId } = useProject()
    const refetch = useRefetch()

    const [selectedRole, setSelectedRole] = React.useState<GuideRole>('backend')
    const [loading, setLoading] = React.useState(false)
    const [guide, setGuide] = React.useState('')

    const { data: savedGuides, isLoading: guidesLoading } = api.project.getOnboardingGuides.useQuery(
        { projectId },
        { enabled: !!projectId }
    )
    const saveGuide = api.project.saveOnboardingGuide.useMutation()
    const deleteGuide = api.project.deleteOnboardingGuide.useMutation()

    const handleGenerate = async () => {
        if (!projectId) return
        setGuide('')
        setLoading(true)

        const { output } = await generateOnboardingGuide(projectId, selectedRole)
        for await (const delta of readStreamableValue(output)) {
            if (delta) setGuide(g => g + delta)
        }
        setLoading(false)
    }

    const handleSave = () => {
        if (!guide.trim()) return
        saveGuide.mutate(
            { projectId, role: selectedRole, content: guide },
            {
                onSuccess: () => {
                    toast.success('Guide saved')
                    refetch()
                    setGuide('')
                },
                onError: () => toast.error('Failed to save guide'),
            }
        )
    }

    const handleDelete = (guideId: string) => {
        deleteGuide.mutate(
            { guideId },
            {
                onSuccess: () => { toast.success('Guide deleted'); refetch() },
                onError: () => toast.error('Failed to delete guide'),
            }
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-violet-500/20">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Onboarding Guide</h1>
                            <p className="text-sm text-gray-500">
                                Generate a personalised reading curriculum for any new team member
                            </p>
                        </div>
                    </div>
                </div>

                {/* Generator card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                            New hire's role
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {roles.map(r => (
                                <button
                                    key={r.value}
                                    onClick={() => setSelectedRole(r.value)}
                                    className={cn(
                                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center',
                                        selectedRole === r.value
                                            ? 'border-violet-500 bg-violet-50 shadow-sm shadow-violet-500/10'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    )}
                                >
                                    <div className={cn(
                                        'w-9 h-9 rounded-lg flex items-center justify-center',
                                        selectedRole === r.value ? 'bg-violet-100' : 'bg-gray-100'
                                    )}>
                                        <r.icon className={cn(
                                            'h-4.5 w-4.5',
                                            selectedRole === r.value ? 'text-violet-600' : 'text-gray-500'
                                        )} />
                                    </div>
                                    <div>
                                        <p className={cn(
                                            'text-xs font-semibold',
                                            selectedRole === r.value ? 'text-violet-700' : 'text-gray-700'
                                        )}>
                                            {r.label}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                                            {r.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleGenerate}
                            disabled={loading || !projectId}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm shadow-violet-500/20 rounded-xl h-10 px-5"
                        >
                            {loading
                                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</>
                                : <><Sparkles className="h-4 w-4 mr-2" />Generate Guide</>
                            }
                        </Button>
                        {guide && !loading && (
                            <Button
                                variant="outline"
                                onClick={() => setGuide('')}
                                className="rounded-xl h-10 text-gray-500 border-gray-200 hover:border-gray-300"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        )}
                    </div>

                    {/* Streaming output */}
                    <AnimatePresence>
                        {(loading || guide) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="border border-gray-100 rounded-xl bg-gray-50 p-5">
                                    {loading && !guide && (
                                        <div className="flex items-center gap-3 text-violet-600 py-2">
                                            <div className="flex gap-1">
                                                {[0, 0.1, 0.2].map((delay, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ y: [0, -6, 0] }}
                                                        transition={{ repeat: Infinity, duration: 0.6, delay }}
                                                        className="w-1.5 h-1.5 bg-violet-500 rounded-full"
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-medium">
                                                Analysing codebase and crafting your guide...
                                            </span>
                                        </div>
                                    )}
                                    {guide && (
                                        <div data-color-mode="light">
                                            <MDEditor.Markdown
                                                source={guide}
                                                className="prose prose-sm max-w-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {guide && !loading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-end mt-3"
                                    >
                                        <Button
                                            onClick={handleSave}
                                            disabled={saveGuide.isPending}
                                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl h-9 px-4 text-sm"
                                        >
                                            {saveGuide.isPending
                                                ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Saving...</>
                                                : <><Save className="h-3.5 w-3.5 mr-2" />Save guide</>
                                            }
                                        </Button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Saved guides */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-900">Saved Guides</h2>
                        {savedGuides && savedGuides.length > 0 && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                                {savedGuides.length} {savedGuides.length === 1 ? 'guide' : 'guides'}
                            </Badge>
                        )}
                    </div>

                    {guidesLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-2xl" />
                            ))}
                        </div>
                    ) : savedGuides && savedGuides.length > 0 ? (
                        <div className="space-y-3">
                            {savedGuides.map(g => (
                                <SavedGuideCard
                                    key={g.id}
                                    guide={g}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <BookOpen className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">No saved guides yet</p>
                            <p className="text-xs text-gray-400">
                                Generate a guide above and save it to share with new team members
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
