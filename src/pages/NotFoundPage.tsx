import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="text-5xl mb-4">🥃</div>
      <h1 className="text-2xl font-bold text-whisky-700 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6">This dram seems to have evaporated.</p>
      <Link to="/" className="px-4 py-2 bg-whisky-600 text-white rounded-lg">Go Home</Link>
    </div>
  )
}
