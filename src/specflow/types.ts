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

export type Viewport = {
  x: number
  y: number
  zoom: number
}

export type Canvas = {
  nodes: AppNode[]
  edges: Edge[]
  viewport: Viewport
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
  apiSettings: APISettings
}

// ===== API Settings Types =====

export type LLMModel = {
  id: string      // Unique identifier (e.g., "openai-gpt4", "anthropic-claude-3")
  name: string    // Display name (e.g., "GPT-4", "Claude 3 Opus")
}

export type LLMProvider = {
  id: string           // Unique provider ID (e.g., "openai", "anthropic", "ollama")
  name: string         // Display name (e.g., "OpenAI", "Anthropic")
  endpoint: string     // API endpoint URL
  apiKey: string       // API key (stored in settings)
  models: LLMModel[]   // Available models for this provider
}

export type CodeSearchProvider = {
  id: string
  name: string
  apiKey: string
}

export type APISettings = {
  codeSearch: {
    activeProvider: string  // Currently only "relace"
    providers: CodeSearchProvider[]
  }
  llm: {
    providers: LLMProvider[]
  }
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
