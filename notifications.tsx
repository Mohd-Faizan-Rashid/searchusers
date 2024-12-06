'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './auth-context'
import { Sidebar } from './sidebar'
import { Button } from '@/components/ui/button'

type FriendRequest = {
  id: string
  from: string
  to: string
  status: 'pending' | 'accepted' | 'rejected'
  fromUsername: string
}

export default function Notifications() {
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'friendRequests'),
      where('to', '==', user.uid),
      where('status', '==', 'pending')
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests: FriendRequest[] = []
      for (const doc of snapshot.docs) {
        const data = doc.data() as FriendRequest
        const userDoc = await getDoc(doc(db, 'users', data.from))
        requests.push({
          id: doc.id,
          ...data,
          fromUsername: userDoc.data()?.username
        })
      }
      setRequests(requests)
    })

    return () => unsubscribe()
  }, [user])

  const handleRequest = async (requestId: string, accept: boolean) => {
    if (!user) return

    const requestRef = doc(db, 'friendRequests', requestId)
    if (accept) {
      await updateDoc(requestRef, { status: 'accepted' })
      // Add to friends list for both users
      const request = requests.find(r => r.id === requestId)
      if (request) {
        await updateDoc(doc(db, 'users', user.uid), {
          friends: arrayUnion(request.from)
        })
        await updateDoc(doc(db, 'users', request.from), {
          friends: arrayUnion(user.uid)
        })
      }
    } else {
      await deleteDoc(requestRef)
    }
  }

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-72">
        <div className="px-4 py-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">Friend Requests</h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-card rounded-lg">
                <div className="font-semibold">{request.fromUsername}</div>
                <div className="flex gap-2">
                  <Button onClick={() => handleRequest(request.id, true)}>
                    Accept
                  </Button>
                  <Button variant="destructive" onClick={() => handleRequest(request.id, false)}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <p className="text-muted-foreground">No pending friend requests</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

