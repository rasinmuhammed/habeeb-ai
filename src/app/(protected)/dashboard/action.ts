'use server'
import Groq from 'groq-sdk'
import { createStreamableValue } from 'ai/rsc'
import { generateEmbedding } from '@/lib/groq'
import { db } from '@/server/db'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!
})

// Helper function to retry database queries
async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation()
        } catch (error: any) {
            const isLastAttempt = i === maxRetries - 1
            const isConnectionError = 
                error.code === 'P1017' || 
                error.message?.includes('connection') ||
                error.message?.includes('closed')
            
            if (isConnectionError && !isLastAttempt) {
                console.log(`Database connection failed, retrying... (${i + 1}/${maxRetries})`)
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
                continue
            }
            throw error
        }
    }
    throw new Error('Max retries exceeded')
}

export async function askQuestion(question: string, projectId: string) {
    const stream = createStreamableValue()

    try {
        // Generate embedding with retry
        const queryVector = await withRetry(() => generateEmbedding(question))
        const vectorQuery = `[${queryVector.join(',')}]`

        // Query database with retry
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

        // Build context using only summaries to stay within token limits
        let context = ''
        for (const doc of result) {
            context += `File: ${doc.fileName}\nSummary: ${doc.summary}\n\n`
        }

        // If no results found, provide a fallback
        if (result.length === 0) {
            stream.update("I couldn't find any relevant files in the codebase to answer your question. Please try rephrasing your question or asking about a different topic.")
            stream.done()
            return {
                output: stream.value,
                fileReferences: result
            }
        }

        (async () => {
            try {
                const completion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern who is new to the organization.

Guidelines:
- Be concise, helpful, and friendly
- Focus on the most relevant information from the provided context
- If the context doesn't contain enough information, say so honestly
- Use markdown syntax with code snippets when helpful
- Give step-by-step explanations when appropriate`
                        },
                        {
                            role: "user",
                            content: `Here are summaries of relevant files from the codebase:

${context}

Question: ${question}

Please answer based on the file summaries provided above. If you need to reference specific code, mention the file name.`
                        }
                    ],
                    model: "meta-llama/llama-4-scout-17b-16e-instruct",
                    temperature: 0.5,
                    max_tokens: 1500,
                    stream: true,
                })

                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        stream.update(content)
                    }
                }
                stream.done()
            } catch (error: any) {
                console.error('Error in askQuestion:', error)
                
                // Handle different error types
                if (error.status === 413 || error.message?.includes('rate_limit_exceeded')) {
                    stream.update('⚠️ The request was too large. Please try asking a more specific question about a particular file or feature.')
                } else if (error.status === 429) {
                    stream.update('⚠️ Rate limit reached. Please wait a moment and try again.')
                } else {
                    stream.update(`⚠️ Sorry, I encountered an error: ${error.message || 'Failed to generate response'}. Please try again.`)
                }
                stream.done()
            }
        })()

        return {
            output: stream.value,
            fileReferences: result
        }
    } catch (error: any) {
        console.error('Database error in askQuestion:', error)
        stream.update('⚠️ Database connection error. Please try again in a moment.')
        stream.done()
        return {
            output: stream.value,
            fileReferences: []
        }
    }
}