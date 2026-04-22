/**
 * Thin wrapper around the Web NFC API (available in Chrome/Android only).
 * All functions gracefully handle unsupported environments.
 */

/** True if the browser supports Web NFC writing (Android Chrome). */
export function isNfcWriteSupported(): boolean {
  return 'NDEFReader' in window
}

/** Write a URL record to the next tapped NFC tag. */
export async function writeNfcUrl(url: string): Promise<void> {
  if (!isNfcWriteSupported()) {
    throw new Error('Web NFC is not supported in this browser.')
  }
  // NDEFReader is not in TypeScript's lib yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const NDEFReader = (window as any).NDEFReader as any
  const reader = new NDEFReader()
  await reader.write({
    records: [{ recordType: 'url', data: url }],
  })
}
