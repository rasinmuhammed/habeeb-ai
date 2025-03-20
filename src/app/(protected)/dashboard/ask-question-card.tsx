'use-client'

import MDEditor from "@uiw/react-md-editor"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useProject from "@/hooks/use-project"
import { Card } from "@/components/ui/card"
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

const AskQuestionCard = () => {
    const { project } = useProject()
    const [open,setOpen] = React.useState(false)
    const [question, setQuestion] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [fileReferences, setFileReferences]=React.useState<{ fileName: string; sourceCode: string; summary: string}[]>([])
    const [answer, setAnswer] = React.useState('')
    const saveAnswer = api.project.saveAnswer.useMutation()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('')
        setFileReferences([])
        e.preventDefault()
        if(!project?.id) return
        setLoading(true)
        setOpen(true)

        const {output, fileReferences} = await askQuestion(question, project.id)
        setOpen(true)
        setFileReferences(fileReferences)

        for await (const delta of readStreamableValue(output)){
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
           
            <DialogContent className="sm:max-w-[80vw]">
            <DialogHeader>
                <div className="flex item-center gap-2">
                <DialogTitle>
                    <Image src='/logo.png' alt='habeebAI' height={40} width={40}/>
                </DialogTitle>
                <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={() => 
                    saveAnswer.mutate({
                        projectId: project!.id,
                        question,
                        answer,
                        fileReferences
                    }, {
                        onSuccess: () => {
                            toast.success('Answer saved successfully')
                            refetch()
                        },
                        onError: () => {
                            toast.error('Failed to save answer')
                        }
                    })}>

                    Save Answer
                    </Button>
                </div>        
            </DialogHeader>
            <div data-color-mode="light">
            <MDEditor.Markdown source={answer} className="max-w-[70vw] !h-full max-h-[40vh] overflow-scroll" />
            </div>
            <div className="h-4"></div>
            <CodeReferences fileReferences={fileReferences}/>
            <Button type="button" onClick={() => setOpen(false)}>
                Close
            </Button>
            </DialogContent>

            

        </Dialog>
        <Card className="relative col-span-3">
            <CardHeader>
                <CardTitle>
                    Ask a Question
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit}>
                    <Textarea placeholder="Which file should I edit to change the homepage?" value={question} onChange={e => setQuestion(e.target.value)}/>
                    <div className="h-4"></div>
                    <Button type="submit" disabled={loading}>
                        Ask HabeebAI
                        </Button>
                </form>
            </CardContent>
        </Card>
        </>
    )
}

export default AskQuestionCard