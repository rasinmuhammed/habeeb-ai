'use client'

import MDEditor from "@uiw/react-md-editor"
import useProject from "@/hooks/use-project"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import React from "react"
import { Dialog, DialogHeader, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { askQuestion } from "./action"
import { readStreamableValue } from "ai/rsc"
import CodeReferences from "./code-references"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import useRefetch from "@/hooks/use-refetch"
import { MessageSquare, Save, Loader2, Sparkles, Bot, FileCode2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { DecisionTrail } from "@/lib/decision-trail"
import { DecisionTrailView } from "@/components/decision-trail-view"

// ─── Main Component ─────────────────────────────────────────────────────────

const AskQuestionCardInner = () => {
    const { project } = useProject()
    const searchParams = useSearchParams()
    const [open, setOpen] = React.useState(false)
    const [question, setQuestion] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [fileReferences, setFileReferences] = React.useState<{ fileName: string; sourceCode: string; summary: string }[]>([])
    const [answer, setAnswer] = React.useState('')
    const [decisionTrail, setDecisionTrail] = React.useState<DecisionTrail | null>(null)
    const saveAnswer = api.project.saveAnswer.useMutation()
    const refetch = useRefetch()

    React.useEffect(() => {
        const prefill = searchParams.get('prefill')
        if (prefill) {
            setQuestion(decodeURIComponent(prefill))
            window.history.replaceState({}, '', window.location.pathname)
        }
    }, [searchParams])

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!project?.id) return
        setAnswer('')
        setFileReferences([])
        setDecisionTrail(null)
        setLoading(true)
        setOpen(true)

        const { output, fileReferences, decisionTrail: trail } = await askQuestion(question, project.id)
        setFileReferences(fileReferences)
        setDecisionTrail(trail)

        for await (const delta of readStreamableValue(output)) {
            if (delta) setAnswer(ans => ans + delta)
        }
        setLoading(false)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[85vw] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white">
                    <DialogHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25"
                                >
                                    <Bot className="h-6 w-6 text-white" />
                                </motion.div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-900">
                                        AI Response
                                    </DialogTitle>
                                    <p className="text-sm text-gray-500">Powered by HabeebAI</p>
                                </div>
                            </div>
                            <Button
                                disabled={saveAnswer.isPending || loading}
                                variant="outline"
                                className="border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300 rounded-xl"
                                onClick={() =>
                                    saveAnswer.mutate(
                                        { projectId: project!.id, question, answer, fileReferences },
                                        {
                                            onSuccess: () => { toast.success('Answer saved'); refetch(); setOpen(false) },
                                            onError: () => toast.error('Failed to save answer')
                                        }
                                    )
                                }
                            >
                                {saveAnswer.isPending
                                    ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    : <Save className="h-4 w-4 mr-2" />
                                }
                                Save Answer
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="mt-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-xl p-4 mb-6"
                        >
                            <p className="text-sm font-medium text-violet-900 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Your Question
                            </p>
                            <p className="text-gray-700 mt-2 font-medium">{question}</p>
                        </motion.div>

                        <div data-color-mode="light" className="prose prose-violet max-w-none">
                            <AnimatePresence mode="wait">
                                {loading && !answer && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-3 text-violet-600 py-4"
                                    >
                                        <div className="flex gap-1">
                                            {[0, 0.1, 0.2].map((delay, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ y: [0, -8, 0] }}
                                                    transition={{ repeat: Infinity, duration: 0.6, delay }}
                                                    className="w-2 h-2 bg-violet-600 rounded-full"
                                                />
                                            ))}
                                        </div>
                                        <span className="font-medium">Searching codebase and history...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <MDEditor.Markdown source={answer || (loading ? "" : "Waiting for response...")} />
                        </div>

                        <AnimatePresence>
                            {fileReferences.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-6"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                            <FileCode2 className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Referenced Files</h3>
                                            <p className="text-sm text-gray-500">{fileReferences.length} files analyzed</p>
                                        </div>
                                    </div>
                                    <CodeReferences fileReferences={fileReferences} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {decisionTrail && !loading && (
                            <DecisionTrailView trail={decisionTrail} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Card className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardHeader className="pb-4 relative">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Ask a Question</h3>
                            <p className="text-sm text-gray-500">Get AI answers with full decision history</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <Textarea
                            placeholder="Why is auth structured this way? What led to this decision?"
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            className="min-h-[120px] border-2 border-gray-200 focus:border-violet-500 resize-none rounded-xl bg-gray-50 focus:bg-white transition-colors"
                            required
                        />
                        <Button
                            type="submit"
                            disabled={loading || !question.trim()}
                            size="lg"
                            className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all rounded-xl"
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Thinking...</>
                            ) : (
                                <><Sparkles className="mr-2 h-5 w-5" />Ask HabeebAI</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

const AskQuestionCardSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse space-y-4">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
            <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
        </div>
        <div className="h-28 bg-gray-100 rounded-xl" />
        <div className="h-12 bg-gray-200 rounded-xl" />
    </div>
)

const AskQuestionCard = () => (
    <React.Suspense fallback={<AskQuestionCardSkeleton />}>
        <AskQuestionCardInner />
    </React.Suspense>
)

export default AskQuestionCard
