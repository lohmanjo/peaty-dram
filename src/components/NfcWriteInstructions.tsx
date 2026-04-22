import { useState } from 'react'
import { isNfcWriteSupported, writeNfcUrl } from '@/lib/nfc'
import { CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'

interface Props {
  tagUrl: string   // full URL to write, e.g. https://yourapp.com/t/tag-abc123
}

/**
 * Shown after bottle registration to guide the user through writing the URL
 * to the NFC sticker.
 *
 * - Android (Chrome): Web NFC write button
 * - Everything else: Step-by-step NFC Tools app instructions
 */
export default function NfcWriteInstructions({ tagUrl }: Props) {
  const supportsWrite = isNfcWriteSupported()
  const [copied, setCopied]         = useState(false)
  const [writing, setWriting]       = useState(false)
  const [writeOk, setWriteOk]       = useState(false)
  const [writeError, setWriteError] = useState('')

  async function handleCopy() {
    await navigator.clipboard.writeText(tagUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleWrite() {
    setWriting(true)
    setWriteError('')
    try {
      await writeNfcUrl(tagUrl)
      setWriteOk(true)
    } catch (e) {
      setWriteError((e as Error).message ?? 'Write failed. Try again.')
    } finally {
      setWriting(false)
    }
  }

  if (writeOk) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4">
        <CheckCircleIcon className="w-6 h-6 text-green-600 shrink-0" />
        <p className="text-sm text-green-800 font-medium">Tag written successfully! Tap the sticker to test it.</p>
      </div>
    )
  }

  return (
    <div className="bg-whisky-50 border border-whisky-200 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-whisky-800 text-sm">Write URL to NFC Sticker</h3>

      {/* URL display + copy */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
        <code className="text-xs text-gray-700 break-all flex-1">{tagUrl}</code>
        <button type="button" onClick={handleCopy} className="shrink-0 text-gray-400 hover:text-whisky-600">
          {copied
            ? <CheckCircleIcon className="w-5 h-5 text-green-500" />
            : <ClipboardDocumentIcon className="w-5 h-5" />}
        </button>
      </div>

      {supportsWrite ? (
        /* Android Chrome — Web NFC path */
        <div className="space-y-2">
          <p className="text-xs text-gray-600">
            Hold your phone over the NFC sticker, then tap the button below.
          </p>
          <button
            type="button"
            onClick={handleWrite}
            disabled={writing}
            className="w-full bg-whisky-600 hover:bg-whisky-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
          >
            {writing ? 'Waiting for tag…' : '📡 Write tag now'}
          </button>
          {writeError && <p className="text-red-500 text-xs">{writeError}</p>}
        </div>
      ) : (
        /* iOS / other — NFC Tools instructions */
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">
            Use the free <strong>NFC Tools</strong> app to write this URL:
          </p>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Open <strong>NFC Tools</strong> (App Store / Play Store)</li>
            <li>Tap <strong>Write</strong> → <strong>Add a record</strong></li>
            <li>Choose <strong>URL / URI</strong></li>
            <li>Paste the URL above and tap <strong>OK</strong></li>
            <li>Tap <strong>Write / 30 Bytes</strong> and hold your phone on the sticker</li>
          </ol>
          <a
            href="https://apps.apple.com/app/nfc-tools/id1252962749"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-whisky-700 underline"
          >
            NFC Tools on App Store →
          </a>
        </div>
      )}
    </div>
  )
}
