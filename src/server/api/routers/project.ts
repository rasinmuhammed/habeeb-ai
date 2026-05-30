import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"
import { pollCommits } from "@/lib/github"
import { checkCredits, indexGithubRepo } from "@/lib/github-loader"
import { fetchDecisionTrail } from "@/lib/decision-trail"


export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional()
        })
    ).mutation(async ({ ctx, input }) => {
        const user = await ctx.db.user.findUnique({ where: { id: ctx.user.userId! }, select: { credits: true } })
        if (!user) {
            throw new Error('User not found')
        }

        const currentCredits = user.credits || 0
        const fileCount = await checkCredits(input.githubUrl, input.githubToken)

        if (currentCredits < fileCount) {
            throw new Error('Insufficient credits')
        }

        const project = await ctx.db.project.create({
            data: {
                githubUrl: input.githubUrl,
                name: input.name,
                userToProjects: {
                    create: {
                        userId: ctx.user.userId!,
                    }
                }

            }
        })

        await indexGithubRepo(project.id, input.githubUrl, input.githubToken)
        try {
            await pollCommits(project.id);
        } catch (error) {
            console.error(`Failed to poll commits for project ${project.id}:`, error);
        }
        // Deduct credits & log transaction
        await ctx.db.$transaction([
            ctx.db.user.update({
                where: { id: ctx.user.userId! },
                data: { credits: { decrement: fileCount } }
            }),
            ctx.db.transaction.create({
                data: {
                    userId: ctx.user.userId!,
                    credits: -fileCount, // Negative to show deduction
                }
            })
        ]);

        return project
    }),

    getProjects: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.project.findMany({
            where: {
                userToProjects: {
                    some: {
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null
            }
        })
    }),

    getCommits: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ ctx, input }) => {
        // Try to poll new commits in background - don't block on failure
        pollCommits(input.projectId).catch(() => {
            // Silently fail - GitHub token may be invalid
        })
        return await ctx.db.commit.findMany({
            where: { projectId: input.projectId },
            orderBy: { commitDate: 'desc' }
        })
    }),
    saveAnswer: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        fileReferences: z.any()
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.question.create({
            data: {
                answer: input.answer,
                fileReferences: input.fileReferences,
                projectId: input.projectId,
                question: input.question,
                userId: ctx.user.userId!
            }
        })
    }),
    getQuestions: protectedProcedure.input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.question.findMany({
                where: {
                    projectId: input.projectId
                },
                include: {
                    user: true
                },
                orderBy: {
                    createdAt: 'desc'
                }

            })
        }),
    uploadMeeting: protectedProcedure.input(z.object({ projectId: z.string(), meetingUrl: z.string(), name: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const meeting = await ctx.db.meeting.create({
                data: {
                    meetingUrl: input.meetingUrl,
                    projectId: input.projectId,
                    name: input.name,
                    status: "PROCESSING"
                }
            })
            return meeting
        }),
    getMeetings: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findMany({ where: { projectId: input.projectId }, include: { issues: true } })
    }),
    deleteMeeting: protectedProcedure.input(z.object({ meetingId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.meeting.delete({ where: { id: input.meetingId } })
    }),
    getMeetingById: protectedProcedure.input(z.object({ meetingId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findUnique({ where: { id: input.meetingId }, include: { issues: true } })
    }),
    archiveProject: protectedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.project.update({ where: { id: input.projectId }, data: { deletedAt: new Date() } })
    }),
    getTeamMembers: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.userToProject.findMany({ where: { projectId: input.projectId }, include: { user: true } })
    }),
    getMyCredits: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.user.findUnique({ where: { id: ctx.user.userId! }, select: { credits: true } })
    }),
    checkCredits: protectedProcedure.input(z.object({ githubUrl: z.string(), githubToken: z.string().optional() })).mutation(async ({ ctx, input }) => {
        const fileCount = await checkCredits(input.githubUrl, input.githubToken)
        const userCredits = await ctx.db.user.findUnique({ where: { id: ctx.user.userId! }, select: { credits: true } })
        return { fileCount, userCredits: userCredits?.credits || 0 }
    }),
    getTransactions: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.transaction.findMany({
            where: { userId: ctx.user.userId! },
            orderBy: { createdAt: "desc" }
        });
    }),
    addMockTransaction: protectedProcedure.input(
        z.object({
            credits: z.number()
        })
    ).mutation(async ({ ctx, input }) => {
        await ctx.db.$transaction([
            ctx.db.user.update({
                where: { id: ctx.user.userId! },
                data: { credits: { increment: input.credits } }
            }),
            ctx.db.transaction.create({
                data: {
                    userId: ctx.user.userId!,
                    credits: input.credits
                }
            })
        ]);

        return { success: true };
    }),

    // Unified chronological feed: commits + meetings + Q&A merged and sorted by date
    getTimeline: protectedProcedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            const [commits, meetings, questions] = await Promise.all([
                ctx.db.commit.findMany({
                    where: { projectId: input.projectId },
                    orderBy: { commitDate: 'desc' },
                    take: 50
                }),
                ctx.db.meeting.findMany({
                    where: { projectId: input.projectId },
                    include: { issues: { select: { id: true, relatedFiles: true } } },
                    orderBy: { createdAt: 'desc' }
                }),
                ctx.db.question.findMany({
                    where: { projectId: input.projectId },
                    include: {
                        user: { select: { firstName: true, lastName: true, imageUrl: true } }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 30
                })
            ])

            const events = [
                ...commits.map(c => ({
                    type: 'commit' as const,
                    id: c.id,
                    date: c.commitDate,
                    hash: c.commitHash,
                    message: c.commitMessage,
                    summary: c.summary,
                    author: c.commitAuthorName,
                    authorAvatar: c.commitAuthorAvatar,
                })),
                ...meetings.map(m => ({
                    type: 'meeting' as const,
                    id: m.id,
                    date: m.createdAt,
                    name: m.name,
                    status: m.status,
                    issueCount: m.issues.length,
                    linkedCount: m.issues.filter(i =>
                        Array.isArray(i.relatedFiles) && (i.relatedFiles as unknown[]).length > 0
                    ).length,
                })),
                ...questions.map(q => ({
                    type: 'qa' as const,
                    id: q.id,
                    date: q.createdAt,
                    question: q.question,
                    answer: q.answer.slice(0, 200),
                    userName: q.user.firstName
                        ? `${q.user.firstName}${q.user.lastName ? ` ${q.user.lastName}` : ''}`
                        : 'Unknown',
                    userAvatar: q.user.imageUrl ?? '',
                    fileCount: Array.isArray(q.fileReferences)
                        ? (q.fileReferences as unknown[]).length
                        : 0,
                }))
            ]

            return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }),

    // Returns meetings where any issue's relatedFiles contains the given fileName
    getMeetingsForFile: protectedProcedure
        .input(z.object({ projectId: z.string(), fileName: z.string() }))
        .query(async ({ ctx, input }) => {
            const results = await ctx.db.$queryRaw<{
                meetingId: string
                meetingName: string
                issueId: string
                issueGist: string
                createdAt: Date
            }[]>`
                SELECT DISTINCT
                    m.id as "meetingId",
                    m.name as "meetingName",
                    i.id as "issueId",
                    i.gist as "issueGist",
                    m."createdAt"
                FROM "Meeting" m
                JOIN "Issue" i ON i."meetingId" = m.id
                WHERE m."projectId" = ${input.projectId}
                AND i."relatedFiles" IS NOT NULL
                AND EXISTS (
                    SELECT 1 FROM jsonb_array_elements(i."relatedFiles") AS elem
                    WHERE elem->>'fileName' = ${input.fileName}
                )
                ORDER BY m."createdAt" DESC
                LIMIT 5
            `
            return results
        }),

    // Toggle public sharing for a saved answer
    toggleAnswerPublic: protectedProcedure
        .input(z.object({ questionId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const question = await ctx.db.question.findUnique({
                where: { id: input.questionId },
                select: { userId: true, isPublic: true }
            })
            if (!question || question.userId !== ctx.user.userId!) {
                throw new Error('Not authorized')
            }
            return ctx.db.question.update({
                where: { id: input.questionId },
                data: { isPublic: !question.isPublic },
                select: { id: true, isPublic: true }
            })
        }),

    // Public — fetch a shared answer without auth (only if isPublic)
    getPublicAnswer: publicProcedure
        .input(z.object({ questionId: z.string() }))
        .query(async ({ ctx, input }) => {
            const question = await ctx.db.question.findUnique({
                where: { id: input.questionId, isPublic: true },
                include: {
                    user: { select: { firstName: true, lastName: true, imageUrl: true } },
                    project: { select: { name: true } }
                }
            })
            if (!question) return null

            const fileRefs = Array.isArray(question.fileReferences)
                ? (question.fileReferences as { fileName: string; summary: string }[]).map(f => ({
                    fileName: f.fileName,
                    summary: f.summary
                }))
                : []

            const fileNames = fileRefs.map(f => f.fileName).filter(Boolean)
            const trail = await fetchDecisionTrail(fileNames, question.projectId)

            return {
                id: question.id,
                question: question.question,
                answer: question.answer,
                createdAt: question.createdAt,
                fileReferences: fileRefs,
                userName: question.user.firstName
                    ? `${question.user.firstName}${question.user.lastName ? ` ${question.user.lastName}` : ''}`
                    : 'A developer',
                userAvatar: question.user.imageUrl ?? '',
                projectName: question.project.name,
                trail
            }
        }),

    // Returns the full decision trail for a set of files — used in saved Q&A view
    getDecisionTrail: protectedProcedure
        .input(z.object({ projectId: z.string(), fileNames: z.array(z.string()).max(10) }))
        .query(async ({ input }) => {
            return fetchDecisionTrail(input.fileNames, input.projectId)
        }),

    // Returns meetings where any issue's relatedFiles contains any of the given fileNames
    getMeetingsForFiles: protectedProcedure
        .input(z.object({ projectId: z.string(), fileNames: z.array(z.string()).max(10) }))
        .query(async ({ ctx, input }) => {
            if (input.fileNames.length === 0) return []

            const allResults: {
                meetingId: string
                meetingName: string
                issueGist: string
                createdAt: Date
            }[] = []

            for (const fileName of input.fileNames) {
                const rows = await ctx.db.$queryRaw<{
                    meetingId: string
                    meetingName: string
                    issueGist: string
                    createdAt: Date
                }[]>`
                    SELECT DISTINCT
                        m.id as "meetingId",
                        m.name as "meetingName",
                        i.gist as "issueGist",
                        m."createdAt"
                    FROM "Meeting" m
                    JOIN "Issue" i ON i."meetingId" = m.id
                    WHERE m."projectId" = ${input.projectId}
                    AND i."relatedFiles" IS NOT NULL
                    AND EXISTS (
                        SELECT 1 FROM jsonb_array_elements(i."relatedFiles") AS elem
                        WHERE elem->>'fileName' = ${fileName}
                    )
                    ORDER BY m."createdAt" DESC
                    LIMIT 3
                `
                allResults.push(...rows)
            }

            // Deduplicate by meetingId, most recent first
            const seen = new Set<string>()
            return allResults
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .filter(r => {
                    if (seen.has(r.meetingId)) return false
                    seen.add(r.meetingId)
                    return true
                })
                .slice(0, 5)
        }),

})