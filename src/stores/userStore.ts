import { create } from 'zustand'

export interface AppUser {
  id: string
  email: string
  displayName: string
}

interface UserStore {
  user: AppUser | null
  setUser: (user: AppUser) => void
  clearUser: () => void
}

const LOCAL_EMAIL_KEY = 'msms_user_email'
const LOCAL_NAME_KEY = 'msms_user_name'
const LOCAL_ID_KEY = 'msms_user_id'

function loadUserFromStorage(): AppUser | null {
  const email = localStorage.getItem(LOCAL_EMAIL_KEY)
  const displayName = localStorage.getItem(LOCAL_NAME_KEY)
  const id = localStorage.getItem(LOCAL_ID_KEY)
  if (email && id) {
    return { id, email, displayName: displayName ?? email }
  }
  return null
}

export const useUserStore = create<UserStore>((set) => ({
  user: loadUserFromStorage(),
  setUser: (user) => {
    localStorage.setItem(LOCAL_EMAIL_KEY, user.email)
    localStorage.setItem(LOCAL_NAME_KEY, user.displayName)
    localStorage.setItem(LOCAL_ID_KEY, user.id)
    set({ user })
  },
  clearUser: () => {
    localStorage.removeItem(LOCAL_EMAIL_KEY)
    localStorage.removeItem(LOCAL_NAME_KEY)
    localStorage.removeItem(LOCAL_ID_KEY)
    set({ user: null })
  },
}))
