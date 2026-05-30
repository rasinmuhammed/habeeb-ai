'use server'
import Groq from 'groq-sdk'
import { createStreamableValue } from 'ai/rsc'
import { generateEmbedding } from '@/lib/groq'
import { db } from '@/server/db'
import { fetchDecisionTrail, trailToPromptContext, hasTrail, type DecisionTrail } from '@/lib/decision-trail'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation()
        } catch (error: any) {
            const isLast = i === maxRetries - 1
            const isConn =
                error.code === 'P1017' ||
                error.message?.includes('connection') ||
                error.message?.includes('closed')
            if (isConn && !isLast) {
                await new Promise(r => setTimeout(r, delay * (i + 1)))
                continue
            }
            throw error
        }
    }
    throw new Error('Max retries exceeded')
}

export async function askQuestion(question: string, projectId: string): Promise<{
    output: ReturnType<typeof createStreamableValue>['value']
    fileReferences: { fileName: string; sourceCode: string; summary: string }[]
    decisionTrail: DecisionTrail
}> {
    const stream = createStreamableValue()
    const emptyTrail: DecisionTrail = { commits: [], meetings: [], priorQA: [] }

    try {
        const queryVector = await withRetry(() => generateEmbedding(question))
        const vectorQuery = `[${queryVector.join(',')}]`

        const result = await withRetry(() =>
            db.$queryRaw`
                SELECT "fileName", "sourceCode", "summary",
                1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
                FROM "SourceCodeEmbedding"
                WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
                AND "projectId" = ${projectId}
                ORDER BY similarity DESC
                LIMIT 5
            ` as Promise<{ fileName: string; sourceCode: string; summary: string }[]>
        )

        if (result.length === 0) {
            stream.update("I couldn't find any relevant files in the codebase to answer your question. Please try rephrasing or asking about a different topic.")
            stream.done()
            return { output: stream.value, fileReferences: [], decisionTrail: emptyTrail }
        }

        // Fetch decision trail for the top files
        const fileNames = result.map(r => r.fileName)
        const trail = await fetchDecisionTrail(fileNames, projectId).catch(() => emptyTrail)

        // Build file context
        let fileContext = ''
        for (const doc of result) {
            fileContext += `File: ${doc.fileName}\nSummary: ${doc.summary}\n\n`
        }

        // Build historical context
        const trailContext = hasTrail(trail) ? trailToPromptContext(trail) : ''

        ;(async () => {
            try {
                const completion = await groq.chat.completions.create({
                    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                    temperature: 0.5,
                    max_tokens: 1500,
                    stream: true,
                    messages: [
                        {
                            role: 'system',
                            content: `You are an AI assistant helping developers understand their codebase — not just WHAT the code does, but WHY it was built that way.

You have access to:
1. Current code file summaries
2. A decision trail — commits, team meetings, and prior Q&A that shaped the code

Guidelines:
- Answer the question directly and concisely
- When the decision trail reveals WHY something was built a certain way, surface that history in your answer
- Reference specific commits, meetings, or prior discussions when they explain a design decision
- Use markdown with code snippets when helpful
- If the history doesn't explain the why, say so honestly`
                        },
                        {
                            role: 'user',
                            content: `CODEBASE CONTEXT:
${fileContext}
${trailContext ? `DECISION TRAIL — history that shaped this code:\n${trailContext}\n` : ''}
Question: ${question}

Answer the question. If the decision trail reveals why the code works this way, explain it.`
                        }
                    ]
                })

                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) stream.update(content)
                }
                stream.done()
            } catch (error: any) {
                console.error('[askQuestion stream]', error)
                if (error.status === 413 || error.message?.includes('rate_limit_exceeded')) {
                    stream.update('⚠️ Request too large. Try asking a more specific question.')
                } else if (error.status === 429) {
                    stream.update('⚠️ Rate limit reached. Wait a moment and try again.')
                } else {
                    stream.update(`⚠️ Error: ${error.message || 'Failed to generate response'}. Please try again.`)
                }
                stream.done()
            }
        })()

        return { output: stream.value, fileReferences: result, decisionTrail: trail }
    } catch (error: any) {
        console.error('[askQuestion db]', error)
        stream.update('⚠️ Database connection error. Please try again.')
        stream.done()
        return { output: stream.value, fileReferences: [], decisionTrail: emptyTrail }
    }
}
