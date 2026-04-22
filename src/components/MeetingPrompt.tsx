import { useState } from 'react'
import { db } from '@/lib/db'
import { useMeetingStore } from '@/stores/meetingStore'
import { todayYMD, formatDateShort } from '@/lib/utils'
import type { Meeting } from '@/lib/types'

interface Props {
  onDismiss?: () => void
}

type Step = 'choose' | 'name-club' | 'name-personal'

/**
 * Modal that lets the user select or create a meeting/session context.
 * Shown when no active meeting is set and the user tries to do something
 * meeting-scoped (add a review, view tonight's bottles, etc.).
 */
export default function MeetingPrompt({ onDismiss }: Props) {
  const setActiveMeeting = useMeetingStore(s => s.setActiveMeeting)
  const today = todayYMD()
  const existingToday = db.meetings.getByDate(today)

  const [step, setStep]         = useState<Step>('choose')
  const [meetingName, setMeetingName] = useState('')

  function pickExisting(m: Meeting) {
    setActiveMeeting(m)
    onDismiss?.()
  }

  function createClub() {
    const name = meetingName.trim() || formatDateShort(today) + ' Club Night'
    const m = db.meetings.create({ name, date: today, type: 'club' })
    setActiveMeeting(m)
    onDismiss?.()
  }

  function createPersonal() {
    const name = meetingName.trim() || 'Personal Tasting — ' + formatDateShort(today)
    const m = db.meetings.create({ name, date: today, type: 'personal' })
    setActiveMeeting(m)
    onDismiss?.()
  }

  function skipSession() {
    setActiveMeeting(null)
    onDismiss?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        {step === 'choose' && (
          <>
            <h2 className="text-lg font-bold text-whisky-700 mb-1">Tonight's Session</h2>
            <p className="text-gray-500 text-sm mb-4">
              Associate your tasting notes with a session for {formatDateShort(today)}.
            </p>

            <div className="space-y-2">
              {existingToday && (
                <button
                  onClick={() => pickExisting(existingToday)}
                  className="w-full text-left border border-whisky-300 bg-whisky-50 rounded-xl px-4 py-3 hover:bg-whisky-100 transition-colors"
                >
                  <p className="font-semibold text-whisky-800 text-sm">{existingToday.name}</p>
                  <p className="text-xs text-whisky-600 mt-0.5">Resume existing session</p>
                </button>
              )}

              <button
                onClick={() => setStep('name-club')}
                className="w-full text-left border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <p className="font-semibold text-gray-800 text-sm">🥃 Club Meeting</p>
                <p className="text-xs text-gray-500 mt-0.5">Visible to all club members</p>
              </button>

              <button
                onClick={() => setStep('name-personal')}
                className="w-full text-left border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <p className="font-semibold text-gray-800 text-sm">🏠 Personal Tasting</p>
                <p className="text-xs text-gray-500 mt-0.5">Label it whatever you like</p>
              </button>

              <button
                onClick={skipSession}
                className="w-full text-left border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <p className="font-semibold text-gray-800 text-sm">Skip</p>
                <p className="text-xs text-gray-500 mt-0.5">Review without a session</p>
              </button>
            </div>
          </>
        )}

        {(step === 'name-club' || step === 'name-personal') && (
          <>
            <button
              onClick={() => setStep('choose')}
              className="text-sm text-gray-500 hover:text-gray-700 mb-3"
            >
              ← Back
            </button>
            <h2 className="text-lg font-bold text-whisky-700 mb-1">
              {step === 'name-club' ? 'Club Meeting' : 'Personal Tasting'}
            </h2>
            <p className="text-gray-500 text-sm mb-3">Give it a name (optional).</p>

            <input
              type="text"
              value={meetingName}
              onChange={e => setMeetingName(e.target.value)}
              placeholder={
                step === 'name-club'
                  ? `${formatDateShort(today)} Club Night`
                  : `Personal Tasting — ${formatDateShort(today)}`
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-whisky-500"
            />

            <button
              onClick={step === 'name-club' ? createClub : createPersonal}
              className="w-full bg-whisky-600 hover:bg-whisky-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Start Session
            </button>
          </>
        )}
      </div>
    </div>
  )
}
