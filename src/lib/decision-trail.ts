import { db } from '@/server/db'

export type CommitTrail = {
    hash: string
    message: string
    summary: string
    authorName: string
    date: Date
}

export type MeetingTrail = {
    meetingId: string
    meetingName: string
    issueGist: string
    date: Date
}

export type QATrail = {
    questionId: string
    question: string
    askedBy: string | null
    date: Date
}

export type DecisionTrail = {
    commits: CommitTrail[]
    meetings: MeetingTrail[]
    priorQA: QATrail[]
}

export async function fetchDecisionTrail(
    fileNames: string[],
    projectId: string
): Promise<DecisionTrail> {
    if (fileNames.length === 0) {
        return { commits: [], meetings: [], priorQA: [] }
    }

    const targets = fileNames.slice(0, 3)

    // Commits — search summaries for the base filename (summaries use short names)
    const commitMap = new Map<string, CommitTrail>()
    await Promise.all(
        targets.map(async (fileName) => {
            const basename = fileName.split('/').pop() ?? fileName
            const rows = await db.commit.findMany({
                where: {
                    projectId,
                    summary: { contains: basename, mode: 'insensitive' }
                },
                orderBy: { commitDate: 'desc' },
                take: 3,
                select: {
                    commitHash: true,
                    commitMessage: true,
                    summary: true,
                    commitAuthorName: true,
                    commitDate: true
                }
            })
            for (const r of rows) {
                if (!commitMap.has(r.commitHash)) {
                    commitMap.set(r.commitHash, {
                        hash: r.commitHash,
                        message: r.commitMessage,
                        summary: r.summary,
                        authorName: r.commitAuthorName,
                        date: r.commitDate
                    })
                }
            }
        })
    )
    const commits = [...commitMap.values()]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5)

    // Meetings — issues where relatedFiles contains the fileName
    const meetingMap = new Map<string, MeetingTrail>()
    await Promise.all(
        targets.map(async (fileName) => {
            const rows = await db.$queryRaw<{
                meetingId: string
                meetingName: string
                issueGist: string
                createdAt: Date
            }[]>`
                SELECT DISTINCT
                    m.id          AS "meetingId",
                    m.name        AS "meetingName",
                    i.gist        AS "issueGist",
                    m."createdAt"
                FROM "Meeting" m
                JOIN "Issue"   i ON i."meetingId" = m.id
                WHERE m."projectId" = ${projectId}
                AND   i."relatedFiles" IS NOT NULL
                AND   EXISTS (
                    SELECT 1
                    FROM   jsonb_array_elements(i."relatedFiles") AS elem
                    WHERE  elem->>'fileName' = ${fileName}
                )
                ORDER BY m."createdAt" DESC
                LIMIT 3
            `
            for (const r of rows) {
                if (!meetingMap.has(r.meetingId)) {
                    meetingMap.set(r.meetingId, {
                        meetingId: r.meetingId,
                        meetingName: r.meetingName,
                        issueGist: r.issueGist,
                        date: r.createdAt
                    })
                }
            }
        })
    )
    const meetings = [...meetingMap.values()]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5)

    // Prior Q&A — questions whose fileReferences contains the fileName
    const qaMap = new Map<string, QATrail>()
    await Promise.all(
        targets.map(async (fileName) => {
            const rows = await db.$queryRaw<{
                id: string
                question: string
                firstName: string | null
                lastName: string | null
                createdAt: Date
            }[]>`
                SELECT
                    q.id,
                    q.question,
                    u."firstName",
                    u."lastName",
                    q."createdAt"
                FROM "Question" q
                JOIN "User"     u ON u.id = q."userId"
                WHERE q."projectId" = ${projectId}
                AND   q."fileReferences" IS NOT NULL
                AND   EXISTS (
                    SELECT 1
                    FROM   jsonb_array_elements(q."fileReferences") AS elem
                    WHERE  elem->>'fileName' = ${fileName}
                )
                ORDER BY q."createdAt" DESC
                LIMIT 3
            `
            for (const r of rows) {
                if (!qaMap.has(r.id)) {
                    qaMap.set(r.id, {
                        questionId: r.id,
                        question: r.question,
                        askedBy: r.firstName
                            ? `${r.firstName}${r.lastName ? ` ${r.lastName}` : ''}`
                            : null,
                        date: r.createdAt
                    })
                }
            }
        })
    )
    const priorQA = [...qaMap.values()]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5)

    return { commits, meetings, priorQA }
}

export function trailToPromptContext(trail: DecisionTrail): string {
    const lines: string[] = []

    if (trail.commits.length > 0) {
        lines.push('COMMITS THAT TOUCHED THESE FILES:')
        for (const c of trail.commits) {
            lines.push(
                `• ${c.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — ${c.message}`
            )
            if (c.summary) lines.push(`  ${c.summary.slice(0, 120)}`)
        }
    }

    if (trail.meetings.length > 0) {
        if (lines.length) lines.push('')
        lines.push('TEAM MEETINGS THAT DISCUSSED THIS CODE:')
        for (const m of trail.meetings) {
            lines.push(
                `• ${m.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — ${m.meetingName}: "${m.issueGist}"`
            )
        }
    }

    if (trail.priorQA.length > 0) {
        if (lines.length) lines.push('')
        lines.push('PRIOR TEAM QUESTIONS ABOUT THESE FILES:')
        for (const q of trail.priorQA) {
            lines.push(`• "${q.question}"`)
        }
    }

    return lines.join('\n')
}

export function hasTrail(trail: DecisionTrail): boolean {
    return trail.commits.length > 0 || trail.meetings.length > 0 || trail.priorQA.length > 0
}
