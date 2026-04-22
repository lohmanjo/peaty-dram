import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import TagLandingPage from '@/pages/TagLandingPage'
import BottleDetailPage from '@/pages/BottleDetailPage'
import ReviewPage from '@/pages/ReviewPage'
import NewBottlePage from '@/pages/NewBottlePage'
import MeetingsPage from '@/pages/MeetingsPage'
import MeetingDetailPage from '@/pages/MeetingDetailPage'
import SearchPage from '@/pages/SearchPage'
import ProfilePage from '@/pages/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* NFC tap entry point — no layout chrome needed */}
        <Route path="/t/:tagId" element={<TagLandingPage />} />

        {/* Main app with nav layout */}
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/bottle/new" element={<NewBottlePage />} />
          <Route path="/bottle/:bottleId" element={<BottleDetailPage />} />
          <Route path="/bottle/:bottleId/review" element={<ReviewPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/meeting/:meetingId" element={<MeetingDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
