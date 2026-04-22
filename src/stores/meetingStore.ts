import { create } from 'zustand'

export interface Meeting {
  id: string
  name: string
  date: string        // ISO date string YYYY-MM-DD
  type: 'club' | 'personal' | 'none'
}

interface MeetingStore {
  activeMeeting: Meeting | null
  setActiveMeeting: (meeting: Meeting | null) => void
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  activeMeeting: null,
  setActiveMeeting: (meeting) => set({ activeMeeting: meeting }),
}))
