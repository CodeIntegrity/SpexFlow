import type { AppNode } from '../types'

type Props = {
  selectedNode: AppNode | null
  multiSelectCount: number
  patchSelectedNode: (patch: (n: AppNode) => AppNode) => void
  deleteSelectedNodes: () => void
  runNode: (nodeId: string) => void
  runFrom: (nodeId: string) => void
}

export function NodeSidebar({
  selectedNode,
  multiSelectCount,
  patchSelectedNode,
  deleteSelectedNodes,
  runNode,
  runFrom,
}: Props) {
  // Multi-select: don't show sidebar (use MultiSelectInfo instead)
  if (multiSelectCount > 1) return null

  // Single node view
  if (!selectedNode) return null

  return (
    <div className="sfSidebar">
      <div>
        <div className="sfHeader">{selectedNode.data.title}</div>

        <label className="sfLabel">
          <div>locked</div>
          <input
            type="checkbox"
            checked={!!selectedNode.data.locked}
            onChange={(e) =>
              patchSelectedNode((n) => ({ ...n, data: { ...n.data, locked: e.target.checked } }) as AppNode)
            }
          />
        </label>

        <div className="sfSectionTitle">Settings</div>

        {selectedNode.type === 'code-search' ? (
          <>
            <label className="sfLabel">
              repoPath
              <input
                className="sfInput"
                value={selectedNode.data.repoPath ?? ''}
                disabled={!!selectedNode.data.locked}
                onChange={(e) =>
                  patchSelectedNode((n) =>
                    n.type === 'code-search' ? { ...n, data: { ...n.data, repoPath: e.target.value } } : n,
                  )
                }
              />
            </label>
            <label className="sfLabel">
              query
              <textarea
                className="sfTextarea"
                value={selectedNode.data.query ?? ''}
                disabled={!!selectedNode.data.locked}
                onChange={(e) =>
                  patchSelectedNode((n) =>
                    n.type === 'code-search' ? { ...n, data: { ...n.data, query: e.target.value } } : n,
                  )
                }
                rows={5}
              />
            </label>
            <label className="sfLabel">
              <div>debugMessages</div>
              <input
                type="checkbox"
                checked={!!selectedNode.data.debugMessages}
                disabled={!!selectedNode.data.locked}
                onChange={(e) =>
                  patchSelectedNode((n) =>
                    n.type === 'code-search'
                      ? { ...n, data: { ...n.data, debugMessages: e.target.checked } }
                      : n,
                  )
                }
              />
            </label>
          </>
        ) : null}

        {selectedNode.type === 'code-search-conductor' ? (
          <label className="sfLabel">
            model
            <input
              className="sfInput"
              value={selectedNode.data.model ?? ''}
              disabled={!!selectedNode.data.locked}
              onChange={(e) =>
                patchSelectedNode((n) =>
                  n.type === 'code-search-conductor' ? { ...n, data: { ...n.data, model: e.target.value } } : n,
                )
              }
            />
          </label>
        ) : null}

        {selectedNode.type === 'context-converter' ? (
          <label className="sfLabel">
            <div>fullFile</div>
            <input
              type="checkbox"
              checked={!!selectedNode.data.fullFile}
              disabled={!!selectedNode.data.locked}
              onChange={(e) =>
                patchSelectedNode((n) =>
                  n.type === 'context-converter'
                    ? { ...n, data: { ...n.data, fullFile: e.target.checked } }
                    : n,
                )
              }
            />
          </label>
        ) : null}

        {selectedNode.type === 'instruction' ? (
          <label className="sfLabel">
            text
            <textarea
              className="sfTextarea"
              value={selectedNode.data.text ?? ''}
              disabled={!!selectedNode.data.locked}
              onChange={(e) =>
                patchSelectedNode((n) =>
                  n.type === 'instruction' ? { ...n, data: { ...n.data, text: e.target.value } } : n,
                )
              }
              rows={8}
            />
          </label>
        ) : null}

        {selectedNode.type === 'llm' ? (
          <>
            <label className="sfLabel">
              model
              <input
                className="sfInput"
                value={selectedNode.data.model ?? ''}
                disabled={!!selectedNode.data.locked}
                onChange={(e) =>
                  patchSelectedNode((n) =>
                    n.type === 'llm' ? { ...n, data: { ...n.data, model: e.target.value } } : n,
                  )
                }
              />
            </label>
            <label className="sfLabel">
              systemPrompt
              <textarea
                className="sfTextarea"
                value={selectedNode.data.systemPrompt ?? ''}
                disabled={!!selectedNode.data.locked}
                onChange={(e) =>
                  patchSelectedNode((n) =>
                    n.type === 'llm' ? { ...n, data: { ...n.data, systemPrompt: e.target.value } } : n,
                  )
                }
                rows={6}
              />
            </label>
            <label className="sfLabel">
              query
              <textarea
                className="sfTextarea"
                value={selectedNode.data.query ?? ''}
                disabled={!!selectedNode.data.locked}
                onChange={(e) =>
                  patchSelectedNode((n) =>
                    n.type === 'llm' ? { ...n, data: { ...n.data, query: e.target.value } } : n,
                  )
                }
                rows={4}
              />
            </label>
          </>
        ) : null}

        <div className="sfSectionTitle">Output</div>
        {selectedNode.data.error ? (
          <pre className="sfOutput sfOutputError">{selectedNode.data.error}</pre>
        ) : null}

        {selectedNode.type === 'code-search' ? (
          <pre className="sfOutput">
            {selectedNode.data.output ? JSON.stringify(selectedNode.data.output, null, 2) : '(no output)'}
          </pre>
        ) : null}

        {selectedNode.type === 'code-search-conductor' ? (
          <pre className="sfOutput">
            {selectedNode.data.output ? JSON.stringify(selectedNode.data.output, null, 2) : '(no output)'}
          </pre>
        ) : null}

        {selectedNode.type === 'context-converter' ? (
          <pre className="sfOutput">{selectedNode.data.output ?? '(no output)'}</pre>
        ) : null}

        {selectedNode.type === 'instruction' ? (
          <pre className="sfOutput">{selectedNode.data.output ?? '(no output)'}</pre>
        ) : null}

        {selectedNode.type === 'llm' ? (
          <pre className="sfOutput">{selectedNode.data.output ?? '(no output)'}</pre>
        ) : null}

        <div className="sfButtons">
          <button onClick={() => runNode(selectedNode.id)} disabled={!!selectedNode.data.locked}>
            Run
          </button>
          <button onClick={() => runFrom(selectedNode.id)} disabled={!!selectedNode.data.locked}>
            Chain
          </button>
          <button
            onClick={() => {
              const text =
                selectedNode.type === 'code-search' || selectedNode.type === 'code-search-conductor'
                  ? selectedNode.data.output
                    ? JSON.stringify(selectedNode.data.output, null, 2)
                    : ''
                  : selectedNode.data.output ?? ''
              navigator.clipboard.writeText(text)
            }}
          >
            Copy
          </button>
          <button onClick={deleteSelectedNodes}>Delete</button>
        </div>
      </div>
    </div>
  )
}
