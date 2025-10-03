'use server'
import Groq from 'groq-sdk'
import { createStreamableValue } from 'ai/rsc'
import { generateEmbedding } from '@/lib/groq'
import { db } from '@/server/db'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!
})

export async function askQuestion(question: string, projectId: string) {
    const stream = createStreamableValue()

    const queryVector = await generateEmbedding(question)
    const vectorQuery = `[${queryVector.join(',')}]`

    const result = await db.$queryRaw`
        SELECT "fileName", "sourceCode", "summary",
        1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
        FROM "SourceCodeEmbedding"
        WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
        AND "projectId" = ${projectId}
        ORDER BY similarity DESC
        LIMIT 10
    ` as { fileName: string; sourceCode: string; summary: string }[]

    let context = ''

    for (const doc of result) {
        context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nSummary of file: ${doc.summary}\n\n`
    }

    (async () => {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern who is new to the organization, and wants to learn the codebase.
AI assistant is a brand new, powerful, human-like artificial intelligence.
The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is a well-behaved and well-mannered individual.
AI is always friendly, kind and inspiring, and eager to provide vivid and thoughtful responses to the user.
AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in the world.
If the question is about code or a specific file, AI will provide the detailed answer, giving step by step instructions.`
                },
                {
                    role: "user",
                    content: `START CONTEXT BLOCK
${context}
END CONTEXT BLOCK

START QUESTION
${question}
END QUESTION

AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer".
AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
AI assistant will not invent anything that is not drawn directly from the context.
Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, make sure the dialogues are directly to the user in a conversational manner.`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 2000,
            stream: true,
        })

        for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
                stream.update(content)
            }
        }
        stream.done()
    })()

    return {
        output: stream.value,
        fileReferences: result
    }
}