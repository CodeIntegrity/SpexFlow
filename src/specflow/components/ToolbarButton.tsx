import { useState, useRef } from 'react'

type Props = {
  icon: React.ReactNode
  label: string
  description: string
  shortcut?: string
  isActive?: boolean
  onClick: () => void
}

export function ToolbarButton({ icon, label, description, shortcut, isActive, onClick }: Props) {
  const [isHovered, setIsHovered] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  function handleMouseEnter() {
    timeoutRef.current = window.setTimeout(() => {
      setIsHovered(true)
    }, 300)
  }

  function handleMouseLeave() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsHovered(false)
  }

  return (
    <div className="sfToolbarButtonWrapper">
      <button
        className={`sfToolbarButton ${isActive ? 'sfToolbarActive' : ''}`}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      >
        {icon}
      </button>

      {isHovered && (
        <div className="sfToolbarTooltip">
          <div className="sfToolbarTooltipContent">
            <div className="sfToolbarTooltipHeader">
              <span className="sfToolbarTooltipLabel">{label}</span>
              {shortcut && <span className="sfToolbarTooltipShortcut">{shortcut}</span>}
            </div>
            <div className="sfToolbarTooltipDesc">{description}</div>
          </div>
        </div>
      )}
    </div>
  )
}
