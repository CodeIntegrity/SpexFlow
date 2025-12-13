import { useCallback, useRef } from 'react'
import type { Edge } from '@xyflow/react'
import type { AppData, AppNode, Tab } from '../types'
import type { Selected } from './useAppData'
import { deepClone, getActiveTab, resetNodeRuntimeForPaste, uid } from '../utils'

export function useClipboard(
  appDataRef: React.RefObject<AppData>,
  selectedRef: React.RefObject<Selected>,
  setAppData: React.Dispatch<React.SetStateAction<AppData>>,
  setSelected: React.Dispatch<React.SetStateAction<Selected>>,
) {
  const clipboardRef = useRef<{ nodes: AppNode[]; edges: Edge[] } | null>(null)
  const pasteSerial = useRef(0)

  const copySelectedNodes = useCallback(() => {
    const sel = selectedRef.current
    if (!sel || sel.nodeIds.length === 0) return

    const snap = getActiveTab(appDataRef.current)
    const selectedSet = new Set(sel.nodeIds)
    const nodes = snap.canvas.nodes.filter((n) => selectedSet.has(n.id))
    const edges = snap.canvas.edges.filter(
      (e) => selectedSet.has(e.source) && selectedSet.has(e.target),
    )
    clipboardRef.current = { nodes: deepClone(nodes), edges: deepClone(edges) }
  }, [appDataRef, selectedRef])

  const pasteClipboard = useCallback(() => {
    const clip = clipboardRef.current
    if (!clip || clip.nodes.length === 0) return

    pasteSerial.current += 1
    const delta = 40 + (pasteSerial.current % 6) * 10
    const idMap = new Map<string, string>()
    const newNodes = clip.nodes.map((n) => {
      const newId = uid('n')
      idMap.set(n.id, newId)
      const cloned = resetNodeRuntimeForPaste(deepClone(n))
      return {
        ...cloned,
        id: newId,
        selected: true,
        position: { x: cloned.position.x + delta, y: cloned.position.y + delta },
      }
    })
    const newEdges = clip.edges.map((e) => {
      const source = idMap.get(e.source)
      const target = idMap.get(e.target)
      if (!source || !target) throw new Error('pasteClipboard: missing source/target remap')
      return { ...deepClone(e), id: uid('e'), source, target, selected: false }
    })

    setAppData((d) => {
      const activeId = d.activeTabId
      if (!activeId) return d
      return {
        ...d,
        tabs: d.tabs.map((t) =>
          t.id !== activeId
            ? t
            : {
                ...t,
                canvas: {
                  nodes: [...t.canvas.nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
                  edges: [...t.canvas.edges.map((e) => ({ ...e, selected: false })), ...newEdges],
                },
              },
        ),
      }
    })

    setSelected({ nodeIds: newNodes.map((n) => n.id), primaryId: newNodes[newNodes.length - 1].id })
  }, [appDataRef, setAppData, setSelected])

  return {
    copySelectedNodes,
    pasteClipboard,
  }
}
