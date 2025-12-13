type Props = {
  count: number
  primaryTitle?: string
  onCopy: () => void
  onDelete: () => void
}

export function MultiSelectInfo({ count, primaryTitle, onCopy, onDelete }: Props) {
  return (
    <div className="sfMultiSelectInfo">
      <div className="sfMultiSelectHeader">
        <span className="sfMultiSelectCount">{count}</span>
        <span className="sfMultiSelectLabel">nodes selected</span>
      </div>
      {primaryTitle && <div className="sfMultiSelectPrimary">Primary: {primaryTitle}</div>}
      <div className="sfMultiSelectActions">
        <button onClick={onCopy}>Copy</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}
