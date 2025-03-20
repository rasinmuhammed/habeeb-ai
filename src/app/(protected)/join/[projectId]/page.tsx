import { db } from '@/server/db'
import { clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { auth } from '@clerk/nextjs/server'

type Props = {
    params: Promise<{ projectId: string }>
}

const JoinHandler = async (props: Props) => {
    const { projectId } = await props.params
    const { userId } = await auth()
    if (!userId) {
        throw new Error("User ID is null or undefined")
    }
    const dbUser = await db.user.findUnique({
        where: {
            id: userId
        }
    })
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    if (!dbUser) {
        await db.user.create({
            data: {
                id: userId,
                emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
                imageUrl: user.imageUrl,
                firstName: user.firstName,
                lastName: user.lastName,
            }
        })
    }
    const project = await db.project.findUnique({
        where: {
            id: projectId
        }
    })
    if (!project) return redirect("/dashboard")
    try {
        await db.userToProject.create({
            data: {
                userId,
                projectId
            }
        })
    } catch ( error ){
      console.log("User already in project!")  
    }
    return redirect('/dashboard')
}

export default JoinHandler