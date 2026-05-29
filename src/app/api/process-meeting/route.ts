import { processMeeting } from "@/lib/assembly";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { linkIssueToCode } from "@/lib/meeting-code-link";

const bodyParser = z.object({
    meetingUrl: z.string(),
    projectId: z.string(),
    meetingId: z.string()
})

export const maxDuration = 300

export async function POST(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
        const body = await req.json()
        const { meetingUrl, projectId, meetingId } = bodyParser.parse(body)

        const { summaries } = await processMeeting(meetingUrl)

        await db.issue.createMany({
            data: summaries.map(summary => ({
                start: summary.start,
                end: summary.end,
                gist: summary.gist,
                headline: summary.headline,
                summary: summary.summary,
                meetingId
            }))
        })

        // Mark completed immediately so the UI unblocks
        await db.meeting.update({
            where: { id: meetingId },
            data: {
                status: "COMPLETED",
                name: summaries[0]!.headline,
            }
        })

        // Enrich each issue with code links in parallel — runs after meeting is already COMPLETED
        const createdIssues = await db.issue.findMany({ where: { meetingId } })

        await Promise.allSettled(
            createdIssues.map(async (issue) => {
                const relatedFiles = await linkIssueToCode(issue, projectId)
                await db.issue.update({
                    where: { id: issue.id },
                    data: { relatedFiles }
                })
            })
        )

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('[process-meeting]', error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
