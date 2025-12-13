import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ReactFlow, Background, MiniMap } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useAppData, useNodeRunner, useChainRunner, useClipboard, useHotkeys } from './hooks'
import { NodeSidebar, ToolbarButton, MultiSelectInfo, APISettingsModal, SettingsIcon } from './components'
import type { APISettings, Viewport } from './types'
import {
  HandIcon,
  SelectIcon,
  SearchIcon,
  ConductorIcon,
  DocumentIcon,
  InstructionIcon,
  LLMIcon,
  ResetIcon,
} from './components/Icons'
import { ChainManager } from './ChainManager'
import { sameIdSet } from './utils'
import {
  CodeSearchConductorNodeView,
  CodeSearchNodeView,
  ContextConverterNodeView,
  InstructionNodeView,
  LLMNodeView,
} from './nodes'

export function SpecFlowApp() {
  const {
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
    updateActiveViewport,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    patchSelectedNode,
    patchNodeById,
  } = useAppData()

  const { inFlightRuns, runNode, nodeToLocalOutput } = useNodeRunner(appDataRef, patchNodeById)

  const { chainRuns, cancelChain, runFrom, resetActiveCanvasAll } = useChainRunner(
    appDataRef,
    updateActiveCanvas,
    inFlightRuns,
    runNode,
    nodeToLocalOutput,
  )

  const { copySelectedNodes, pasteClipboard } = useClipboard(
    appDataRef,
    selectedRef,
    setAppData,
    setSelected,
  )

  const { interactionMode, setInteractionMode, spaceHeld } = useHotkeys(copySelectedNodes, pasteClipboard)

  const [isDragSelecting, setIsDragSelecting] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Live viewport ref for immediate access (not debounced)
  const liveViewportRef = useRef<Viewport>(activeTab.canvas.viewport ?? { x: 0, y: 0, zoom: 1 })

  // Debounced viewport save handler
  const viewportTimerRef = useRef<number | null>(null)

  const handleViewportChange = useCallback((viewport: Viewport) => {
    // Update live ref immediately
    liveViewportRef.current = viewport
    // Debounce the save
    if (viewportTimerRef.current) {
      window.clearTimeout(viewportTimerRef.current)
    }
    viewportTimerRef.current = window.setTimeout(() => {
      updateActiveViewport(viewport)
    }, 300)  // Debounce 300ms to avoid too frequent saves
  }, [updateActiveViewport])

  // Sync liveViewportRef when switching tabs
  useEffect(() => {
    liveViewportRef.current = activeTab.canvas.viewport ?? { x: 0, y: 0, zoom: 1 }
  }, [activeTab.id])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewportTimerRef.current) {
        window.clearTimeout(viewportTimerRef.current)
      }
    }
  }, [])

  const updateAPISettings = useCallback((newSettings: APISettings) => {
    setAppData(prev => ({
      ...prev,
      apiSettings: newSettings
    }))
  }, [setAppData])

  const nodeTypes = useMemo(
    () => ({
      'code-search': CodeSearchNodeView,
      'code-search-conductor': CodeSearchConductorNodeView,
      'context-converter': ContextConverterNodeView,
      instruction: InstructionNodeView,
      llm: LLMNodeView,
    }),
    [],
  )

  const primarySelectedNode =
    selected && selected.nodeIds.length > 0
      ? activeTab.canvas.nodes.find((n) => n.id === selected.primaryId) ?? null
      : null

  const selectedNode = selected && selected.nodeIds.length === 1 ? primarySelectedNode : null

  return (
    <div className="sfRoot">
      <ChainManager runs={chainRuns} onCancel={cancelChain} />

      {/* Tab bar */}
      <div className="sfTabs">
        {appData.tabs.map((t) => (
          <div
            key={t.id}
            className={t.id === appData.activeTabId ? 'sfTab sfTabActive' : 'sfTab'}
            onClick={() => setActiveTabId(t.id)}
          >
            <span
              className="sfTabName"
              onDoubleClick={(e) => {
                e.stopPropagation()
                renameTab(t.id)
              }}
              title={t.name}
            >
              {t.name}
            </span>
            {appData.tabs.length > 1 && (
              <button
                className="sfTabClose"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(t.id)
                }}
                title="Close tab"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <div className="sfTabActions">
          <button className="sfTabAdd" onClick={addTab} title="New canvas">
            +
          </button>
          <button
            className="sfSettingsBtn"
            onClick={() => setIsSettingsOpen(true)}
            title="API Settings"
          >
            <SettingsIcon />
          </button>
        </div>
      </div>

      {/* Main body */}
      <div className="sfBody">
        <div
          className={`sfCanvas ${interactionMode === 'hand' || spaceHeld ? 'sfCanvas--hand' : 'sfCanvas--select'}`}
        >
          {loadError ? <div className="sfLoadErrorBanner">{loadError}</div> : null}

          {/* Toolbar */}
          <div className="sfToolbar">
            <ToolbarButton
              icon={<HandIcon />}
              label="Hand Mode"
              description="Pan and navigate around the canvas by clicking and dragging"
              shortcut="H"
              isActive={interactionMode === 'hand' && !spaceHeld}
              onClick={() => setInteractionMode('hand')}
            />
            <ToolbarButton
              icon={<SelectIcon />}
              label="Select Mode"
              description="Click to select nodes, or drag to create a selection box"
              shortcut="V"
              isActive={interactionMode === 'select' && !spaceHeld}
              onClick={() => setInteractionMode('select')}
            />

            <div className="sfToolbarSeparator" />

            <ToolbarButton
              icon={<SearchIcon />}
              label="Code Search"
              description="Search through your codebase to find relevant code snippets"
              onClick={() => addNode('code-search', liveViewportRef.current)}
            />
            <ToolbarButton
              icon={<ConductorIcon />}
              label="Search Conductor"
              description="Orchestrate multiple code searches in parallel"
              onClick={() => addNode('code-search-conductor', liveViewportRef.current)}
            />
            <ToolbarButton
              icon={<DocumentIcon />}
              label="Context Converter"
              description="Convert code search results into formatted context for LLM"
              onClick={() => addNode('context-converter', liveViewportRef.current)}
            />
            <ToolbarButton
              icon={<InstructionIcon />}
              label="Instruction"
              description="Add custom instructions or prompts to guide the workflow"
              onClick={() => addNode('instruction', liveViewportRef.current)}
            />
            <ToolbarButton
              icon={<LLMIcon />}
              label="LLM"
              description="Process context through a language model to generate responses"
              onClick={() => addNode('llm', liveViewportRef.current)}
            />

            <div className="sfToolbarSpacer" />

            <ToolbarButton
              icon={<ResetIcon />}
              label="Reset Canvas"
              description="Clear all node outputs and reset the canvas to idle state"
              onClick={resetActiveCanvasAll}
            />
          </div>

          {/* React Flow canvas */}
          <ReactFlow
            key={activeTab.id}
            nodes={rfNodes}
            edges={activeTab.canvas.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            panOnDrag={interactionMode === 'hand' || spaceHeld}
            selectionOnDrag={interactionMode === 'select' && !spaceHeld}
            multiSelectionKeyCode="Shift"
            onSelectionStart={() => setIsDragSelecting(true)}
            onSelectionEnd={() => setIsDragSelecting(false)}
            onSelectionChange={(params) => {
              const ids = params.nodes.map((n) => n.id)
              setSelected((prev) => {
                if (ids.length === 0) return null
                const primaryCandidate = ids[ids.length - 1]
                const primaryId = prev && ids.includes(prev.primaryId) ? prev.primaryId : primaryCandidate
                if (prev && prev.primaryId === primaryId && sameIdSet(prev.nodeIds, ids)) return prev
                return { nodeIds: ids, primaryId }
              })
            }}
            deleteKeyCode={['Backspace', 'Delete']}
            defaultViewport={activeTab.canvas.viewport}
            onViewportChange={handleViewportChange}
            minZoom={0.1}
          >
            <Background />
            <MiniMap
              className="sfMiniMap"
              pannable
              zoomable
              nodeStrokeWidth={3}
              position="bottom-left"
            />
          </ReactFlow>
        </div>

        {/* Multi-select info box */}
        {!isDragSelecting && selected && selected.nodeIds.length > 1 && (
          <MultiSelectInfo
            count={selected.nodeIds.length}
            primaryTitle={primarySelectedNode?.data.title}
            onCopy={copySelectedNodes}
            onDelete={deleteSelectedNodes}
          />
        )}

        {/* Sidebar */}
        {!isDragSelecting && (
          <NodeSidebar
            selectedNode={selectedNode}
            multiSelectCount={selected?.nodeIds.length ?? 0}
            patchSelectedNode={patchSelectedNode}
            deleteSelectedNodes={deleteSelectedNodes}
            runNode={(nodeId) => runNode(nodeId).catch(() => {})}
            runFrom={(nodeId) => runFrom(nodeId).catch(() => {})}
            apiSettings={appData.apiSettings}
          />
        )}
      </div>

      {/* API Settings Modal */}
      <APISettingsModal
        isOpen={isSettingsOpen}
        settings={appData.apiSettings}
        onSave={updateAPISettings}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
