import { DocumentIcon } from './Icons'

type CodeSearchOutput = {
  explanation?: string
  files: Record<string, Array<[number, number]>>
}

type Props = {
  output: CodeSearchOutput
}

export function CodeSearchOutputPreview({ output }: Props) {
  const fileEntries = Object.entries(output.files || {})

  return (
    <div className="sfCodeSearchOutput">
      {fileEntries.length > 0 && (
        <div className="sfCodeSearchFiles">
          {fileEntries.map(([filePath, ranges]) => (
            <div key={filePath} className="sfCodeSearchFile">
              <span className="sfCodeSearchFileIcon">
                <DocumentIcon size={14} />
              </span>
              <span className="sfCodeSearchFilePath" title={filePath}>
                {filePath}
              </span>
              <span className="sfCodeSearchRanges">
                {ranges.map(([start, end], idx) => (
                  <span key={idx} className="sfCodeSearchRange">
                    L{start}-{end}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}

      {fileEntries.length === 0 && !output.explanation && (
        <div className="sfCodeSearchEmpty">No results</div>
      )}
    </div>
  )
}
