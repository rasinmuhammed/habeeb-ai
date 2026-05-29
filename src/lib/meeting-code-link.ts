import Groq from 'groq-sdk'
import { generateEmbedding } from './groq'
import { hybridSearch } from './hybrid-search'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export type RelatedFile = {
    fileName: string
    summary: string
    relevanceExplanation: string
    score: number
}

export async function linkIssueToCode(
    issue: { headline: string; gist: string; summary: string },
    projectId: string
): Promise<RelatedFile[]> {
    try {
        const searchQuery = `${issue.gist} ${issue.headline}`
        const queryVector = await generateEmbedding(searchQuery)

        const results = await hybridSearch(queryVector, searchQuery, projectId, {
            maxResults: 3,
            minSimilarity: 0.2
        })

        if (results.length === 0) return []

        const completion = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 0.2,
            max_tokens: 400,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: 'You are a code analyst. Respond only with valid JSON in the format: {"files": [{"fileName": "...", "explanation": "..."}]}'
                },
                {
                    role: 'user',
                    content: `Meeting issue: "${issue.gist} — ${issue.headline}"

Code files found:
${results.map((f, i) => `${i + 1}. ${f.fileName}: ${f.summary}`).join('\n')}

For each file, write ONE precise sentence (max 20 words) explaining why it is directly relevant to this meeting issue.
Return JSON: {"files": [{"fileName": "exact filename from above", "explanation": "..."}]}`
                }
            ]
        })

        const raw = completion.choices[0]?.message?.content ?? '{}'
        let explanations: { fileName: string; explanation: string }[] = []

        try {
            const parsed = JSON.parse(raw) as { files?: { fileName: string; explanation: string }[] }
            explanations = parsed.files ?? []
        } catch {
            explanations = []
        }

        return results.map(result => {
            const exp = explanations.find(e => e.fileName === result.fileName)
            return {
                fileName: result.fileName,
                summary: result.summary,
                relevanceExplanation: exp?.explanation ?? result.summary.slice(0, 140),
                score: result.combinedScore
            }
        })
    } catch (error) {
        console.error('[meeting-code-link] Failed to link issue to code:', error)
        return []
    }
}
