'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './auth-context'
import { Sidebar } from './sidebar'

type Post = {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: number
  imageUrl?: string
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts: Post[] = []
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as Post)
      })
      setPosts(posts)
    })

    return () => unsubscribe()
  }, [user])

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-72">
        <div className="px-4 py-6 lg:px-8">
          {posts.map((post) => (
            <div key={post.id} className="mb-8 p-4 bg-card rounded-lg">
              <div className="font-semibold mb-2">{post.authorName}</div>
              {post.imageUrl && (
                <img src={post.imageUrl} alt="Post" className="rounded-lg mb-2 max-h-96 object-cover" />
              )}
              <p className="text-muted-foreground">{post.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

