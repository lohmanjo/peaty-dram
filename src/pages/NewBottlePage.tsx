import { useState, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { db } from '@/lib/db'
import { REGIONS } from '@/lib/types'
import { generateTagSlug } from '@/lib/utils'
import NfcWriteInstructions from '@/components/NfcWriteInstructions'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function NewBottlePage() {
  const navigate       = useNavigate()
  const [params]       = useSearchParams()
  const prefilledTag   = params.get('tagId') ?? ''

  const [name, setName]           = useState('')
  const [distillery, setDistillery] = useState('')
  const [region, setRegion]       = useState(REGIONS[0])
  const [customRegion, setCustomRegion] = useState('')
  const [age, setAge]             = useState('')
  const [abv, setAbv]             = useState('')
  const [vintage, setVintage]     = useState('')
  const [tagId, setTagId]         = useState(prefilledTag || generateTagSlug())
  const [images, setImages]       = useState<string[]>([])
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const [created, setCreated]     = useState(false)
  const [bottleId, setBottleId]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const tagUrl = `${window.location.origin}/t/${tagId}`

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim())       e.name       = 'Name is required'
    if (!distillery.trim()) e.distillery = 'Distillery is required'
    return e
  }

  function handleImageFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).slice(0, 5 - images.length).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = e => {
        const result = e.target?.result as string
        setImages(prev => [...prev, result])
      }
      reader.readAsDataURL(file)
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const bottle = db.bottles.create({
      name: name.trim(),
      distillery: distillery.trim(),
      region: region === 'Other' ? (customRegion.trim() || 'Other') : region,
      ageStatement: age ? parseInt(age) : null,
      abv:          abv ? parseFloat(abv) : null,
      vintage:      vintage ? parseInt(vintage) : null,
      imageUrls:    images,
      tagId,
    })
    setBottleId(bottle.id)
    setCreated(true)
  }

  if (created) {
    return (
      <div className="p-4 space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h2 className="text-green-800 font-semibold">Bottle registered! 🎉</h2>
          <p className="text-green-700 text-sm mt-1">Now write the URL to your NFC sticker.</p>
        </div>

        <NfcWriteInstructions tagUrl={tagUrl} />

        <div className="flex gap-2">
          <Link
            to={`/bottle/${bottleId}`}
            className="flex-1 text-center bg-whisky-600 hover:bg-whisky-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            View Bottle
          </Link>
          <Link
            to="/"
            className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
        <h1 className="text-xl font-bold text-whisky-700">Register New Bottle</h1>
      </div>

      {prefilledTag && (
        <div className="bg-whisky-50 border border-whisky-200 rounded-xl p-3 mb-4 text-sm text-whisky-700">
          NFC tag <code className="font-mono text-xs">{prefilledTag}</code> will be linked to this bottle.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bottle name <span className="text-red-400">*</span>
          </label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Laphroaig 10 Year Old"
            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-whisky-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Distillery */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distillery <span className="text-red-400">*</span>
          </label>
          <input
            type="text" value={distillery} onChange={e => setDistillery(e.target.value)}
            placeholder="e.g. Laphroaig"
            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-whisky-500 ${errors.distillery ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.distillery && <p className="text-red-400 text-xs mt-1">{errors.distillery}</p>}
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
          <select
            value={region} onChange={e => setRegion(e.target.value as typeof REGIONS[0])}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-whisky-500"
          >
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {region === 'Other' && (
            <input
              type="text"
              value={customRegion}
              onChange={e => setCustomRegion(e.target.value)}
              placeholder="Enter region name…"
              className="mt-2 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-whisky-500"
            />
          )}
        </div>

        {/* Age / ABV / Vintage */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Age (yrs)</label>
            <input
              type="number" min="1" max="99" value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="NAS"
              className="w-full border border-gray-300 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-whisky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ABV %</label>
            <input
              type="number" min="1" max="99" step="0.1" value={abv}
              onChange={e => setAbv(e.target.value)}
              placeholder="43.0"
              className="w-full border border-gray-300 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-whisky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Vintage</label>
            <input
              type="number" min="1900" max={new Date().getFullYear()} value={vintage}
              onChange={e => setVintage(e.target.value)}
              placeholder="—"
              className="w-full border border-gray-300 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-whisky-500"
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photos (optional)</label>
          <div className="flex gap-2 flex-wrap">
            {images.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute top-0 right-0 bg-black/50 text-white rounded-bl p-0.5"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-whisky-400 hover:text-whisky-500 transition-colors"
              >
                <PhotoIcon className="w-6 h-6" />
              </button>
            )}
          </div>
          <input
            ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleImageFiles(e.target.files)}
          />
          <p className="text-xs text-gray-400 mt-1">Up to 5 photos (front, back, detail…)</p>
        </div>

        {/* NFC Tag ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NFC Tag ID</label>
          <div className="flex gap-2">
            <input
              type="text" value={tagId} onChange={e => setTagId(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-whisky-500"
            />
            <button
              type="button"
              onClick={() => setTagId(generateTagSlug())}
              className="text-xs text-gray-500 border border-gray-200 rounded-xl px-3 hover:bg-gray-50"
            >
              New ID
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            This becomes the URL written to your NFC sticker.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-whisky-600 hover:bg-whisky-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Register Bottle
        </button>
      </form>
    </div>
  )
}
