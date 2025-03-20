'use client'

import React from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism"

type Props = {
    fileReferences: { fileName: string; sourceCode: string; summary: string }[]
}   

const CodeReferences = ({ fileReferences }: Props) => {
    const [tab,setTab] = React.useState(fileReferences[0]?.fileName)
    if (fileReferences.length === 0) return null
    
    return (
        <div className="max-w-[70vw]">
            <Tabs value={tab} onValueChange={setTab}>
                <div className="overflow-scroll flex gap-2 bg-gray-2-- p-1 rounded-md">
                    {fileReferences.map((file) => (
                        <Button onClick={() => setTab(file.fileName)} key={file.fileName} className={cn(
                            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground',
                            {
                                'bg-primary text-primary-foreground': tab === file.fileName,
                            }

                        )}>
                            {file.fileName}
                        </Button>
                    ))}
                </div>
                {fileReferences.map(file => (
                    <TabsContent key={file.fileName} value={file.fileName} className="max-h-[40vh] overflow-scroll max-w-7xl rounded-md">
                        <SyntaxHighlighter language="typecript" style={darcula}>
                         {file.sourceCode}   
                        </SyntaxHighlighter>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default CodeReferences