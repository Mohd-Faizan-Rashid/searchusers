'use client'

import { useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './auth-context'
import { Sidebar } from './sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type User = {
  uid: string
  username: string
  email: string
}

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const { user } = useAuth()

  const handleSearch = async () => {
    if (!searchTerm) return

    const q = query(
      collection(db, 'users'),
      where('username', '>=', searchTerm),
      where('username', '<=', searchTerm + '\uf8ff')
    )

    const snapshot = await getDocs(q)
    const users: User[] = []
    snapshot.forEach((doc) => {
      if (doc.id !== user?.uid) {
        users.push({ uid: doc.id, ...doc.data() } as User)
      }
    })
    setUsers(users)
  }

  const sendFriendRequest = async (userId: string) => {
    if (!user) return
    await setDoc(doc(db, 'friendRequests', `${user.uid}_${userId}`), {
      from: user.uid,
      to: userId,
      status: 'pending',
      createdAt: Date.now()
    })
  }

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-72">
        <div className="px-4 py-6 lg:px-8">
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.uid} className="flex items-center justify-between p-4 bg-card rounded-lg">
                <div>
                  <div className="font-semibold">{user.username}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
                <Button onClick={() => sendFriendRequest(user.uid)}>
                  Send Friend Request
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

