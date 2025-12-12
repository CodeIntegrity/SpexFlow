import type { NodeProps } from '@xyflow/react'
import type { CodeSearchData, ContextConverterData, LLMData, NodeStatus } from './types'

function statusStyle(status: NodeStatus) {
  if (status === 'running') return { background: '#fff7d1', borderColor: '#f2c94c' }
  if (status === 'success') return { background: '#eaffea', borderColor: '#27ae60' }
  if (status === 'error') return { background: '#ffecec', borderColor: '#eb5757' }
  return { background: '#fff', borderColor: '#d0d0d0' }
}

function NodeShell(props: { title: string; status: NodeStatus; subtitle: string }) {
  const style = statusStyle(props.status)
  return (
    <div
      style={{
        width: 220,
        border: `2px solid ${style.borderColor}`,
        background: style.background,
        borderRadius: 10,
        padding: 10,
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 700 }}>{props.title}</div>
      <div style={{ opacity: 0.8, marginTop: 4 }}>{props.subtitle}</div>
      <div style={{ marginTop: 8, opacity: 0.7 }}>status: {props.status}</div>
    </div>
  )
}

export function CodeSearchNodeView({ data }: NodeProps<CodeSearchData>) {
  return (
    <NodeShell
      title={data.title}
      status={data.status}
      subtitle={`repo: ${data.repoPath || '(unset)'}`}
    />
  )
}

export function ContextConverterNodeView({ data }: NodeProps<ContextConverterData>) {
  return (
    <NodeShell
      title={data.title}
      status={data.status}
      subtitle={data.fullFile ? 'full files' : 'line ranges'}
    />
  )
}

export function LLMNodeView({ data }: NodeProps<LLMData>) {
  return (
    <NodeShell
      title={data.title}
      status={data.status}
      subtitle={`model: ${data.model || '(unset)'}`}
    />
  )
}

