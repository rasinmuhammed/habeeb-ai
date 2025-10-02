import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'

const SyncUser = async () => {
    const { userId } = await auth() // Add await here
    if (!userId) {
        throw new Error('No user found')
    }

    const client = await clerkClient() // Clerk client needs await in newer versions
    const user = await client.users.getUser(userId)

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) return notFound()

    await db.user.upsert({
        where: {
            emailAddress: email
        },
        update: {
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        },
        create: {
            id: user.id,
            emailAddress: email,
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        }
    })

    return redirect('/dashboard')
}

export default SyncUser