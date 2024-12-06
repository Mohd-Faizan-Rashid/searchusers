'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './auth-context'
import { Sidebar } from './sidebar'

type Profile = {
  username: string
  email: string
  friends: string[]
}

type Post = {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: number
  imageUrl?: string
}

export default function Profile() {
  const { id } = useParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return
      const docRef = doc(db, 'users', id as string)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setProfile(docSnap.data() as Profile)
      }
    }

    fetchProfile()
  }, [id])

  useEffect(() => {
    if (!id) return

    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', id),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts: Post[] = []
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as Post)
      })
      setPosts(posts)
    })

    return () => unsubscribe()
  }, [id])

  if (!profile) return null

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-72">
        <div className="px-4 py-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
            <p className="mt-2">{profile.friends.length} friends</p>
          </div>
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post.id} className="p-4 bg-card rounded-lg">
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" className="rounded-lg mb-2 max-h-96 object-cover" />
                )}
                <p className="text-muted-foreground">{post.content}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

