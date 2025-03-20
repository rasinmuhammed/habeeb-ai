import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"
import { pollCommits } from "@/lib/github"
import { checkCredits, indexGithubRepo } from "@/lib/github-loader"
import { CarTaxiFront } from "lucide-react"


export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional()
        })
    ).mutation(async ({ctx, input}) => {
        const user = await ctx.db.user.findUnique({ where: { id: ctx.user.userId! }, select: { credits: true }})
        if (!user){
            throw new Error('User not found')
        }

        const currentCredits = user.credits || 0
        const fileCount = await checkCredits(input.githubUrl, input.githubToken)

        if(currentCredits < fileCount ) {
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

        await indexGithubRepo(project.id,input.githubUrl,input.githubToken)
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

    getProjects: protectedProcedure.query( async ({ctx}) => {
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
    })).query(async ({ctx, input}) => {
        pollCommits(input.projectId).then().catch(console.error)
        return await ctx.db.commit.findMany({ where: { projectId: input.projectId }})
    }),
    saveAnswer: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        fileReferences: z.any()
    })).mutation(async ({ctx, input}) => {
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
    getQuestions: protectedProcedure.input(z.object({projectId:z.string()}))
        .query(async ({ctx, input}) => {
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
        uploadMeeting: protectedProcedure.input(z.object({projectId: z.string(), meetingUrl: z.string(), name: z.string()}))
        .mutation(async ({ctx, input}) => {
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
        getMeetings: protectedProcedure.input(z.object({ projectId: z.string()})).query(async ({ctx, input}) => {
            return await ctx.db.meeting.findMany({ where: { projectId: input.projectId}, include: { issues: true }})
        }),
        deleteMeeting: protectedProcedure.input(z.object({meetingId: z.string()})).mutation(async ({ctx, input}) => {
            return await ctx.db.meeting.delete({ where: { id: input.meetingId}})
        }),
        getMeetingById: protectedProcedure.input(z.object({ meetingId: z.string() })).query( async ({ctx, input}) => {
            return await ctx.db.meeting.findUnique({ where: { id: input.meetingId}, include: {issues:true }})
        }),
        archiveProject: protectedProcedure.input(z.object({projectId: z.string()})).mutation(async ({ctx, input}) => {
            return await ctx.db.project.update({ where: {id: input.projectId }, data: {deletedAt: new Date()}})
        }),
        getTeamMembers: protectedProcedure.input(z.object({projectId: z.string() })).query(async ({ ctx, input }) => {
            return await ctx.db.userToProject.findMany({ where: { projectId: input.projectId }, include: { user: true }})
        }),
        getMyCredits: protectedProcedure.query(async ({ctx}) => {
            return await ctx.db.user.findUnique({ where: { id: ctx.user.userId!}, select: {credits: true}})
        }),
        checkCredits: protectedProcedure.input(z.object({githubUrl: z.string(), githubToken: z.string().optional()})).mutation(async ({ctx, input}) => {
            const fileCount = await checkCredits(input.githubUrl, input.githubToken)
            const userCredits = await ctx.db.user.findUnique({where: {id:ctx.user.userId!}, select: {credits: true}})
            return { fileCount, userCredits: userCredits?.credits || 0}
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
        ).mutation(async ({ctx, input}) => {
            await ctx.db.$transaction([
                ctx.db.user.update({
                    where: { id: ctx.user.userId! },
                    data: { credits: { increment: input.credits } }
                }),
                ctx.db.transaction.create({
                    data: {
                        userId: ctx.user.userId!,
                        credits: input.credits // Positive for purchases
                    }
                })
            ]);
        
            return { success: true };
        })
        

        
})