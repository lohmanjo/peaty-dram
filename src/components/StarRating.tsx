/** 1–10 tap-friendly rating picker. */
interface Props {
  value: number | null
  onChange: (v: number) => void
  label?: string
  /** 'warm' = whisky amber (default); 'cool' = slate (used for trust rating) */
  colorScheme?: 'warm' | 'cool'
  disabled?: boolean
}

export default function StarRating({ value, onChange, label, colorScheme = 'warm', disabled }: Props) {
  const active = colorScheme === 'warm'
    ? 'bg-whisky-500 text-white'
    : 'bg-slate-600 text-white'

  return (
    <div>
      {label && <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>}
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
              value === n
                ? active
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
