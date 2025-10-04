'use client'

import MDEditor from "@uiw/react-md-editor"
import useProject from "@/hooks/use-project"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import React from "react"
import { Dialog, DialogHeader, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { askQuestion } from "./action"
import { readStreamableValue } from "ai/rsc"
import CodeReferences from "./code-references"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import useRefetch from "@/hooks/use-refetch"
import { MessageSquare, Save, Loader2, Sparkles, Send } from "lucide-react"

const AskQuestionCard = () => {
    const { project } = useProject()
    const [open, setOpen] = React.useState(false)
    const [question, setQuestion] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [fileReferences, setFileReferences] = React.useState<{ fileName: string; sourceCode: string; summary: string }[]>([])
    const [answer, setAnswer] = React.useState('')
    const saveAnswer = api.project.saveAnswer.useMutation()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('')
        setFileReferences([])
        e.preventDefault()
        if (!project?.id) return
        setLoading(true)
        setOpen(true)

        const { output, fileReferences } = await askQuestion(question, project.id)
        setOpen(true)
        setFileReferences(fileReferences)

        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                setAnswer(ans => ans + delta)
            }
        }
        setLoading(false)
    }
    const refetch = useRefetch()

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[85vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <Image src='/logo.png' alt='habeebAI' height={24} width={24} />
                                </div>
                                <DialogTitle className="text-xl font-bold text-gray-900">
                                    AI Response
                                </DialogTitle>
                            </div>
                            <Button
                                disabled={saveAnswer.isPending || loading}
                                variant="outline"
                                className="border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300"
                                onClick={() =>
                                    saveAnswer.mutate({
                                        projectId: project!.id,
                                        question,
                                        answer,
                                        fileReferences
                                    }, {
                                        onSuccess: () => {
                                            toast.success('Answer saved successfully')
                                            refetch()
                                            setOpen(false)
                                        },
                                        onError: () => {
                                            toast.error('Failed to save answer')
                                        }
                                    })}>
                                {saveAnswer.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Answer
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="mt-4">
                        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-6">
                            <p className="text-sm font-medium text-violet-900">
                                <MessageSquare className="inline h-4 w-4 mr-2" />
                                Your Question
                            </p>
                            <p className="text-gray-700 mt-1">{question}</p>
                        </div>

                        <div data-color-mode="light" className="prose prose-violet max-w-none">
                            {loading && !answer && (
                                <div className="flex items-center gap-2 text-violet-600">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>AI is thinking...</span>
                                </div>
                            )}
                            <MDEditor.Markdown source={answer || "Waiting for response..."} />
                        </div>

                        {fileReferences.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-violet-600 rounded-full" />
                                    <h3 className="text-lg font-semibold text-gray-900">Referenced Files</h3>
                                </div>
                                <CodeReferences fileReferences={fileReferences} />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Card className="relative border-2 border-gray-200 hover:border-violet-300 transition-all shadow-sm hover:shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Ask a Question</h3>
                            <p className="text-sm text-gray-600">Get instant AI-powered answers about your code</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <Textarea
                            placeholder="Which file should I edit to change the homepage?"
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            className="min-h-[100px] border-2 focus:border-violet-500 resize-none"
                            required
                        />
                        <Button
                            type="submit"
                            disabled={loading || !question.trim()}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Ask HabeebAI
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionCard