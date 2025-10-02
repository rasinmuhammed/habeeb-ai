'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function CompleteProfile() {
  const { user } = useUser()
  const router = useRouter()

  const [name, setName] = useState('')
  const [role, setRole] = useState('STUDENT')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/profile', {
      method: 'POST',
      body: JSON.stringify({ name, role }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      alert('Something went wrong!')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4">Complete Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="input input-bordered w-full"
        />

        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
          <option value="PARENT">Parent</option>
        </select>

        <button type="submit" className="btn btn-primary w-full">
          Save and Continue
        </button>
      </form>
    </div>
  )
}
