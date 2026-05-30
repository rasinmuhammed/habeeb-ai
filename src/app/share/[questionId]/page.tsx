'use client'

import React from 'react'
import Link from 'next/link'
import { api } from '@/trpc/react'
import MDEditor from '@uiw/react-md-editor'
import { DecisionTrailView } from '@/components/decision-trail-view'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileCode, Code2, ExternalLink, Sparkles, Clock } from 'lucide-react'
import Image from 'next/image'

type Props = { params: Promise<{ questionId: string }> }

export default function SharePage({ params }: Props) {
    const { questionId } = React.use(params)
    const { data, isLoading } = api.project.getPublicAnswer.useQuery({ questionId })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl animate-pulse" />
                    <p className="text-sm text-gray-400">Loading answer...</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileCode className="h-8 w-8 text-gray-400" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Answer not found</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        This answer doesn't exist or is no longer public.
                    </p>
                    <Link href="/">
                        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl">
                            Try HabeebAI
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">HabeebAI</span>
                    </Link>
                    <Link href="/sign-up">
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg h-8 text-xs px-4"
                        >
                            Get started free
                            <ExternalLink className="h-3 w-3 ml-1.5" />
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
                {/* Question card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <Badge variant="outline" className="text-xs text-gray-500 border-gray-200 gap-1.5">
                            {data.userAvatar && (
                                <Image
                                    src={data.userAvatar}
                                    alt={data.userName}
                                    width={14}
                                    height={14}
                                    className="rounded-full"
                                />
                            )}
                            {data.userName}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-gray-400 border-gray-200 gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(data.createdAt).toLocaleDateString('en-US', {
                                month: 'long', day: 'numeric', year: 'numeric'
                            })}
                        </Badge>
                        {data.projectName && (
                            <Badge variant="outline" className="text-xs text-violet-600 border-violet-200 bg-violet-50">
                                {data.projectName}
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 leading-snug">
                        {data.question}
                    </h1>
                </div>

                {/* Answer */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div data-color-mode="light" className="prose prose-violet max-w-none">
                        <MDEditor.Markdown source={data.answer} />
                    </div>
                </div>

                {/* File references — names only, no source code */}
                {data.fileReferences.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <Code2 className="h-3.5 w-3.5 text-white" />
                            </div>
                            Referenced Files
                            <span className="text-xs text-gray-400 font-normal">
                                — {data.fileReferences.length} {data.fileReferences.length === 1 ? 'file' : 'files'} analyzed
                            </span>
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {data.fileReferences.map(f => (
                                <div
                                    key={f.fileName}
                                    className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5"
                                >
                                    <FileCode className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                                    <span className="text-xs font-mono text-gray-700">{f.fileName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Decision Trail */}
                {data.trail && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <DecisionTrailView trail={data.trail} />
                    </div>
                )}

                {/* Footer CTA */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-8 text-center shadow-lg shadow-violet-500/20">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">
                        The memory your codebase never had
                    </h2>
                    <p className="text-violet-200 text-sm mb-6 max-w-sm mx-auto">
                        Ask why your code was built this way. See the commits, meetings, and decisions behind every answer.
                    </p>
                    <Link href="/sign-up">
                        <Button className="bg-white text-violet-700 hover:bg-violet-50 font-semibold rounded-xl px-6 h-10 shadow-sm">
                            Get started for free
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    )
}
