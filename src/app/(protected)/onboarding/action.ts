'use server'

import Groq from 'groq-sdk'
import { createStreamableValue } from 'ai/rsc'
import { db } from '@/server/db'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export type GuideRole = 'backend' | 'frontend' | 'fullstack' | 'devops'

const roleLabels: Record<GuideRole, string> = {
    backend:   'backend engineer (API routes, database, server-side logic)',
    frontend:  'frontend engineer (UI components, pages, client-side logic)',
    fullstack: 'full-stack engineer',
    devops:    'DevOps / infrastructure engineer (deployment, CI/CD, configuration)',
}

export async function generateOnboardingGuide(projectId: string, role: GuideRole) {
    const stream = createStreamableValue()

    try {
        const [files, commits, qaActivity, meetings] = await Promise.all([
            db.sourceCodeEmbedding.findMany({
                where: { projectId },
                select: { fileName: true, summary: true },
                take: 60,
            }),
            db.commit.findMany({
                where: { projectId },
                orderBy: { commitDate: 'desc' },
                take: 15,
                select: { commitMessage: true, commitDate: true, summary: true },
            }),
            db.$queryRaw<{ fileName: string; cnt: bigint }[]>`
                SELECT elem->>'fileName' AS "fileName", COUNT(*) AS cnt
                FROM   "Question" q
                CROSS  JOIN LATERAL jsonb_array_elements(q."fileReferences") AS elem
                WHERE  q."projectId" = ${projectId}
                AND    q."fileReferences" IS NOT NULL
                GROUP  BY elem->>'fileName'
                ORDER  BY cnt DESC
                LIMIT  10
            `,
            db.meeting.findMany({
                where: { projectId, status: 'COMPLETED' },
                select: { name: true },
                orderBy: { createdAt: 'desc' },
                take: 6,
            }),
        ])

        // Group files by top-level directory for a cleaner context
        const byDir = new Map<string, string[]>()
        for (const f of files) {
            const parts = f.fileName.split('/')
            const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '(root)'
            const list = byDir.get(dir) ?? []
            list.push(`  - \`${f.fileName}\`: ${f.summary}`)
            byDir.set(dir, list)
        }

        const fileContext = [...byDir.entries()]
            .map(([dir, items]) => `**${dir}/**\n${items.join('\n')}`)
            .join('\n\n')

        const commitContext = commits.length
            ? commits.map(c =>
                `- ${new Date(c.commitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${c.commitMessage}`
            ).join('\n')
            : 'No commits yet.'

        const confusionContext = qaActivity.length
            ? qaActivity.map(q => `- \`${q.fileName}\` — ${q.cnt.toString()} question${Number(q.cnt) > 1 ? 's' : ''} asked`).join('\n')
            : 'No Q&A history yet.'

        const meetingContext = meetings.length
            ? meetings.map(m => `- ${m.name}`).join('\n')
            : 'No meetings yet.'

        ;(async () => {
            try {
                const completion = await groq.chat.completions.create({
                    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                    temperature: 0.4,
                    max_tokens: 2500,
                    stream: true,
                    messages: [
                        {
                            role: 'system',
                            content: `You are a senior engineer writing a personalized onboarding guide for a new team member joining this specific codebase.
Your guide is concrete, opinionated, and based on the actual project — not generic advice.
Always reference real file names from the codebase. Use markdown with clear headers.
Tone: direct, encouraging, and specific.`,
                        },
                        {
                            role: 'user',
                            content: `Generate a 3-week onboarding reading guide for a new **${roleLabels[role]}**.

---
## CODEBASE FILES (grouped by directory)
${fileContext}

---
## RECENT COMMITS (what's actively changing)
${commitContext}

---
## FILES THAT CONFUSED PAST DEVELOPERS (high Q&A activity — warn the new hire)
${confusionContext}

---
## RECENT TEAM MEETING TOPICS
${meetingContext}

---

Produce the guide in this exact structure:

# Onboarding Guide — ${role.charAt(0).toUpperCase() + role.slice(1)} Engineer

## Overview
2-3 sentences describing the overall architecture of this codebase and what a ${role} engineer needs to care about most.

## Week 1 — Core Foundation
List the 4-6 most important files for a ${role} engineer to read first. For each file: explain what it does AND why understanding it matters for their role.

## Week 2 — Going Deeper
List the next layer of important files or systems. Focus on the ${role}-relevant internals. Include any areas that are complex or non-obvious.

## Week 3 — Advanced & Active Areas
Cover the most sophisticated parts of the codebase relevant to their role, plus currently active development areas based on recent commits.

## Known Complexity — Read Carefully
List the files that past developers found confusing (from the Q&A history above). Explain WHY each one is tricky and what to watch out for.

## Quick Reference
A short bullet list of the most important files to bookmark, with one-line descriptions.`,
                        },
                    ],
                })

                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) stream.update(content)
                }
                stream.done()
            } catch (err: any) {
                console.error('[generateOnboardingGuide stream]', err)
                stream.update('\n\n⚠️ Generation failed. Please try again.')
                stream.done()
            }
        })()

        return { output: stream.value }
    } catch (err: any) {
        console.error('[generateOnboardingGuide]', err)
        stream.update('⚠️ Failed to load codebase context. Please try again.')
        stream.done()
        return { output: stream.value }
    }
}
