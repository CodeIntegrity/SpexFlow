import type { Edge, Node } from '@xyflow/react'

export type NodeStatus = 'idle' | 'running' | 'success' | 'error'

export type BaseNodeData = {
  title: string
  status: NodeStatus
  error: string | null
  locked: boolean
  muted: boolean  // When true, node output is forced to empty
}

export type CodeSearchOutput = {
  explanation: string
  files: Record<string, [number, number][]>
}

export type CodeSearchData = BaseNodeData & {
  repoPath: string
  query: string
  debugMessages: boolean
  output: CodeSearchOutput | null
}

export type ContextConverterData = BaseNodeData & {
  fullFile: boolean
  output: string | null
}

export type InstructionData = BaseNodeData & {
  text: string
  output: string | null
}

export type ConductorOutput = Record<string, string>

export type CodeSearchConductorData = BaseNodeData & {
  model: string
  query: string
  output: ConductorOutput | null
}

export type LLMData = BaseNodeData & {
  model: string
  systemPrompt: string
  query: string
  output: string | null
}

export type CodeSearchNode = Node<CodeSearchData, 'code-search'>
export type ContextConverterNode = Node<ContextConverterData, 'context-converter'>
export type InstructionNode = Node<InstructionData, 'instruction'>
export type CodeSearchConductorNode = Node<CodeSearchConductorData, 'code-search-conductor'>
export type LLMNode = Node<LLMData, 'llm'>

export type AppNode =
  | CodeSearchNode
  | ContextConverterNode
  | InstructionNode
  | CodeSearchConductorNode
  | LLMNode

export type Canvas = {
  nodes: AppNode[]
  edges: Edge[]
}

export type Tab = {
  id: string
  name: string
  createdAt: string
  canvas: Canvas
}

export type AppData = {
  version: number
  tabs: Tab[]
  activeTabId: string | null
}

export type ChainRunStatus = 'running' | 'completed' | 'cancelled' | 'error'

export type ChainRun = {
  id: string
  startedAt: string
  fromNodeId: string
  fromNodeTitle: string
  nodeIds: string[]
  completedNodeIds: string[]
  failedNodeIds: string[]
  status: ChainRunStatus
  abortController: AbortController
}
