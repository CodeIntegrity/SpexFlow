import { useEffect } from 'react'

type Props = {
  isOpen: boolean
  title: string
  content: string
  onClose: () => void
  closeLabel?: string
  hintClose?: string
  closeTitle?: string
}

export function OutputViewerModal({
  isOpen,
  title,
  content,
  onClose,
  closeLabel = 'Close',
  hintClose = 'Press Escape or click outside to close',
  closeTitle = 'Close (Esc)',
}: Props) {
  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="sfModalBackdrop" onClick={handleBackdropClick}>
      <div className="sfModalContent">
        <div className="sfModalHeader">
          <span className="sfModalTitle">{title}</span>
          <button className="sfModalCloseBtn" onClick={onClose} title={closeTitle}>
            ×
          </button>
        </div>
        <pre className="sfOutputViewerContent">{content}</pre>
        <div className="sfModalFooter">
          <span className="sfModalHint">{hintClose}</span>
          <button className="sfModalSaveBtn" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
