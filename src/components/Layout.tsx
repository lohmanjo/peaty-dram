import { useEffect } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { HomeIcon, MagnifyingGlassIcon, CalendarDaysIcon, UserIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import { useUserStore } from '@/stores/userStore'
import { useMeetingStore } from '@/stores/meetingStore'
import { db } from '@/lib/db'
import { todayYMD } from '@/lib/utils'
import EmailPrompt from './EmailPrompt'

const navItems = [
  { to: '/',         label: 'Home',     Icon: HomeIcon },
  { to: '/search',   label: 'Search',   Icon: MagnifyingGlassIcon },
  { to: '/meetings', label: 'Meetings', Icon: CalendarDaysIcon },
  { to: '/profile',  label: 'Profile',  Icon: UserIcon },
]

export default function Layout() {
  const user           = useUserStore(s => s.user)
  const { activeMeeting, setActiveMeeting } = useMeetingStore()

  // Auto-pick today's meeting on first load if one exists
  useEffect(() => {
    if (!activeMeeting) {
      const todayMeeting = db.meetings.getByDate(todayYMD())
      if (todayMeeting) setActiveMeeting(todayMeeting)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <header className="bg-whisky-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <Link to="/" className="text-lg font-bold tracking-wide">🥃 MSMS</Link>
        <Link
          to="/bottle/new"
          className="flex items-center gap-1 text-whisky-100 hover:text-white text-sm"
        >
          <PlusCircleIcon className="w-5 h-5" />
          Add bottle
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
                isActive ? 'text-whisky-600 font-semibold' : 'text-gray-500'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Email prompt overlay — shown until user identifies themselves */}
      {!user && <EmailPrompt />}
    </div>
  )
}
