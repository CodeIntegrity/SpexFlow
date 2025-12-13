import { useEffect, useState } from 'react'

export type InteractionMode = 'hand' | 'select'

export function useHotkeys(
  copySelectedNodes: () => void,
  pasteClipboard: () => void,
) {
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('hand')
  const [spaceHeld, setSpaceHeld] = useState(false)

  useEffect(() => {
    function shouldIgnoreHotkeys(target: EventTarget | null) {
      const el = target instanceof HTMLElement ? target : null
      if (!el) return false
      if (el.closest('input, textarea, select, [contenteditable="true"]')) return true
      if (window.getSelection()?.toString().trim()) return true
      return false
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat) return
      if (shouldIgnoreHotkeys(e.target)) return

      // Space held = temporary hand mode
      if (e.code === 'Space') {
        e.preventDefault()
        setSpaceHeld(true)
        return
      }

      // Mode switching shortcuts (H = hand, V = select)
      if (e.code === 'KeyH' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setInteractionMode('hand')
        return
      }
      if (e.code === 'KeyV' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setInteractionMode('select')
        return
      }

      const mod = e.metaKey || e.ctrlKey
      if (!mod || e.altKey) return

      if (e.code === 'KeyC') {
        e.preventDefault()
        copySelectedNodes()
        return
      }

      if (e.code === 'KeyV') {
        e.preventDefault()
        pasteClipboard()
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') {
        setSpaceHeld(false)
      }
    }

    document.addEventListener('keydown', onKeyDown, { capture: true })
    document.addEventListener('keyup', onKeyUp, { capture: true })
    return () => {
      document.removeEventListener('keydown', onKeyDown, { capture: true })
      document.removeEventListener('keyup', onKeyUp, { capture: true })
    }
  }, [copySelectedNodes, pasteClipboard])

  return {
    interactionMode,
    setInteractionMode,
    spaceHeld,
  }
}
