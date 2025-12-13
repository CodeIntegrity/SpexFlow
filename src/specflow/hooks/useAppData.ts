import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Edge } from '@xyflow/react'
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import type { Connection, EdgeChange, NodeChange } from '@xyflow/react'
import { defaultAppData, defaultCanvas } from '../defaultData'
import type { AppData, AppNode, Tab } from '../types'
import { fetchAppData, saveAppData } from '../api'
import { getActiveTab, isValidConnection, uid, updateNode } from '../utils'

export type Selected = { nodeIds: string[]; primaryId: string } | null

export function useAppData() {
  const [appData, setAppData] = useState<AppData>(() => defaultAppData())
  const appDataRef = useRef(appData)
  const [selected, setSelected] = useState<Selected>(null)
  const selectedRef = useRef<Selected>(selected)
  const [loadError, setLoadError] = useState<string | null>(null)
  const saveTimer = useRef<number | null>(null)

  const activeTab = useMemo(() => getActiveTab(appData), [appData])
  const rfNodes = useMemo(
    () =>
      activeTab.canvas.nodes.map((n) => ({
        ...n,
        draggable: !n.data.locked,
      })),
    [activeTab.canvas.nodes],
  )

  useEffect(() => {
    appDataRef.current = appData
  }, [appData])

  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  // Load data on mount
  useEffect(() => {
    let alive = true
    fetchAppData()
      .then((data) => {
        if (!alive) return
        setAppData(data)
      })
      .catch((e) => {
        if (!alive) return
        setLoadError(String(e?.message ?? e))
      })
    return () => {
      alive = false
    }
  }, [])

  // Auto-save
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      saveAppData(appData).catch((e) => {
        console.error(e)
      })
    }, 400)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [appData])

  const updateActiveCanvas = useCallback((patch: (tab: Tab) => Tab) => {
    setAppData((d) => {
      const nextTabs = d.tabs.map((t) => (t.id === d.activeTabId ? patch(t) : t))
      return { ...d, tabs: nextTabs }
    })
  }, [])

  const setActiveTabId = useCallback((tabId: string) => {
    setSelected(null)
    setAppData((d) => ({ ...d, activeTabId: tabId }))
  }, [])

  const addTab = useCallback(() => {
    const id = uid('tab')
    const tab: Tab = {
      id,
      name: `Canvas ${appData.tabs.length + 1}`,
      createdAt: new Date().toISOString(),
      canvas: defaultCanvas(),
    }
    setAppData((d) => ({ ...d, tabs: [...d.tabs, tab], activeTabId: id }))
  }, [appData.tabs.length])

  const renameTab = useCallback((tabId: string) => {
    const tab = appDataRef.current.tabs.find((t) => t.id === tabId)
    if (!tab) return
    const nextName = window.prompt('Canvas name?', tab.name) ?? ''
    if (!nextName.trim()) return
    setAppData((d) => ({
      ...d,
      tabs: d.tabs.map((t) => (t.id === tabId ? { ...t, name: nextName.trim() } : t)),
    }))
  }, [])

  const closeTab = useCallback((tabId: string) => {
    setAppData((d) => {
      const nextTabs = d.tabs.filter((t) => t.id !== tabId)
      const nextActive = d.activeTabId === tabId ? (nextTabs[0]?.id ?? null) : d.activeTabId
      return { ...d, tabs: nextTabs, activeTabId: nextActive }
    })
    setSelected(null)
  }, [])

  const deleteSelectedNodes = useCallback(() => {
    const sel = selectedRef.current
    if (!sel) return
    const nodeIds = sel.nodeIds
    const selectedSet = new Set(nodeIds)
    updateActiveCanvas((t) => ({
      ...t,
      canvas: {
        nodes: t.canvas.nodes.filter((n) => !selectedSet.has(n.id)),
        edges: t.canvas.edges.filter((e) => !selectedSet.has(e.source) && !selectedSet.has(e.target)),
      },
    }))
    setSelected(null)
  }, [updateActiveCanvas])

  const onNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) => {
      updateActiveCanvas((t) => ({
        ...t,
        canvas: { ...t.canvas, nodes: applyNodeChanges(changes, t.canvas.nodes) },
      }))
    },
    [updateActiveCanvas],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      updateActiveCanvas((t) => ({
        ...t,
        canvas: { ...t.canvas, edges: applyEdgeChanges(changes, t.canvas.edges) },
      }))
    },
    [updateActiveCanvas],
  )

  const onConnect = useCallback(
    (params: Connection) => {
      const tab = getActiveTab(appDataRef.current)
      const sourceNode = tab.canvas.nodes.find((n) => n.id === params.source)
      const targetNode = tab.canvas.nodes.find((n) => n.id === params.target)
      if (!sourceNode || !targetNode) return

      const result = isValidConnection(sourceNode.type, targetNode.type)
      if (!result.valid) {
        alert(result.reason)
        return
      }

      updateActiveCanvas((t) => ({
        ...t,
        canvas: { ...t.canvas, edges: addEdge(params, t.canvas.edges) },
      }))
    },
    [appDataRef, updateActiveCanvas],
  )

  const addNode = useCallback(
    (type: AppNode['type']) => {
      const id = uid('n')
      const base = {
        id,
        type,
        position: { x: 80, y: 80 + activeTab.canvas.nodes.length * 40 },
      } as const

      let node: AppNode
      if (type === 'code-search') {
        node = {
          ...base,
          type,
          data: {
            title: 'Code Search',
            status: 'idle',
            error: null,
            locked: false,
            muted: false,
            repoPath: '',
            query: '',
            debugMessages: false,
            output: null,
          },
        }
      } else if (type === 'code-search-conductor') {
        node = {
          ...base,
          type,
          data: {
            title: 'Search Conductor',
            status: 'idle',
            error: null,
            locked: false,
            muted: false,
            model: 'x-ai/grok-4.1-fast',
            query: '',
            output: null,
          },
        }
      } else if (type === 'context-converter') {
        node = {
          ...base,
          type,
          data: {
            title: 'Context',
            status: 'idle',
            error: null,
            locked: false,
            muted: false,
            fullFile: true,
            output: null,
          },
        }
      } else if (type === 'instruction') {
        node = {
          ...base,
          type,
          data: {
            title: 'Instruction',
            status: 'idle',
            error: null,
            locked: false,
            muted: false,
            text: '',
            output: null,
          },
        }
      } else {
        node = {
          ...base,
          type,
          data: {
            title: 'LLM',
            status: 'idle',
            error: null,
            locked: false,
            muted: false,
            model: 'x-ai/grok-4.1-fast',
            systemPrompt: '',
            query: '',
            output: null,
          },
        }
      }

      updateActiveCanvas((t) => ({
        ...t,
        canvas: { ...t.canvas, nodes: [...t.canvas.nodes, node] },
      }))
      setSelected({ nodeIds: [id], primaryId: id })
    },
    [activeTab.canvas.nodes.length, updateActiveCanvas],
  )

  const patchSelectedNode = useCallback(
    (patch: (n: AppNode) => AppNode) => {
      const sel = selectedRef.current
      if (!sel || sel.nodeIds.length !== 1) return
      updateActiveCanvas((t) => ({
        ...t,
        canvas: {
          ...t.canvas,
          nodes: updateNode(t.canvas.nodes, sel.primaryId, patch),
        },
      }))
    },
    [updateActiveCanvas],
  )

  const patchNodeById = useCallback(
    (nodeId: string, patch: (n: AppNode) => AppNode) => {
      updateActiveCanvas((t) => ({
        ...t,
        canvas: {
          ...t.canvas,
          nodes: updateNode(t.canvas.nodes, nodeId, patch),
        },
      }))
    },
    [updateActiveCanvas],
  )

  return {
    appData,
    setAppData,
    appDataRef,
    activeTab,
    rfNodes,
    selected,
    setSelected,
    selectedRef,
    loadError,
    setActiveTabId,
    addTab,
    renameTab,
    closeTab,
    deleteSelectedNodes,
    updateActiveCanvas,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    patchSelectedNode,
    patchNodeById,
  }
}
