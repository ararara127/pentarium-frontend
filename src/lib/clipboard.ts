/**
 * Copy text to clipboard with Clipboard API + execCommand fallback for HTTP.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  console.log('[copy] copyTextToClipboard called', {
    length: text.length,
    isSecureContext: window.isSecureContext,
    hasClipboard: Boolean(navigator.clipboard),
    hasWriteText: typeof navigator.clipboard?.writeText === 'function',
  })

  if (
    window.isSecureContext &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    console.log('[copy] using navigator.clipboard.writeText')
    try {
      await navigator.clipboard.writeText(text)
      console.log('[copy] clipboard.writeText succeeded')
      return true
    } catch (err) {
      console.warn('[copy] clipboard.writeText failed, falling back', err)
    }
  } else {
    console.log('[copy] Clipboard API unavailable, using execCommand fallback')
  }

  return copyTextWithExecCommand(text)
}

function copyTextWithExecCommand(text: string): boolean {
  console.log('[copy] fallback execCommand starting')

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  // Keep in viewport & selectable; opacity 0 avoids flashing without display:none
  // (display:none / off-document nodes often make select()/execCommand fail).
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.width = '1px'
  textarea.style.height = '1px'
  textarea.style.padding = '0'
  textarea.style.margin = '0'
  textarea.style.border = 'none'
  textarea.style.outline = 'none'
  textarea.style.boxShadow = 'none'
  textarea.style.background = 'transparent'
  textarea.style.opacity = '0'
  textarea.style.zIndex = '-1'

  document.body.appendChild(textarea)

  const previouslyFocused = document.activeElement as HTMLElement | null

  try {
    textarea.focus()
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)

    const ok = document.execCommand('copy')
    console.log('[copy] document.execCommand("copy") returned', ok)
    return ok
  } catch (err) {
    console.error('[copy] execCommand threw', err)
    return false
  } finally {
    document.body.removeChild(textarea)
    previouslyFocused?.focus?.()
  }
}
