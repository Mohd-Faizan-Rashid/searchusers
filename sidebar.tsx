'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PenSquare, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from './auth-context'

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const routes = [
    {
      icon: Home,
      href: '/',
      label: 'Home'
    },
    {
      icon: Search,
      href: '/search',
      label: 'Search'
    },
    {
      icon: PenSquare,
      href: '/create',
      label: 'Create Post'
    },
    {
      icon: Bell,
      href: '/notifications',
      label: 'Notifications'
    },
    {
      icon: User,
      href: `/profile/${user?.uid}`,
      label: 'Profile'
    }
  ]

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-secondary">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">Social App</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition',
                pathname === route.href ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className="h-5 w-5 mr-3" />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

