import { readFile } from 'node:fs/promises'
import path from 'node:path'

function resolveInRepo(repoRoot: string, filePath: string) {
  const normalized = path.posix.normalize(filePath)
  if (normalized.startsWith('..')) {
    throw new Error(`Invalid file path (escapes repo): ${filePath}`)
  }
  return path.join(repoRoot, ...normalized.split('/'))
}

function renderWithLineNumbers(content: string, start: number, end: number) {
  const lines = content.split('\n')
  const from = Math.max(1, start)
  const to = end === -1 ? lines.length : Math.max(from, end)
  const slice = lines.slice(from - 1, to)
  return slice.map((line, idx) => `${from + idx}   ${line}`).join('\n')
}

export type FileRefs = Record<string, [number, number][]>

export async function buildRepoContext(args: {
  repoRoot: string
  explanation?: string | null
  files: FileRefs
  fullFile: boolean
}) {
  const parts: string[] = []
  if (args.explanation) {
    parts.push('## Explanation')
    parts.push(args.explanation.trimEnd())
    parts.push('')
  }

  parts.push('## Files')

  const filePaths = Object.keys(args.files).sort()
  for (const relPath of filePaths) {
    const abs = resolveInRepo(args.repoRoot, relPath)
    const content = await readFile(abs, 'utf-8')

    parts.push('')
    parts.push(`### ${relPath}`)

    if (args.fullFile) {
      parts.push(renderWithLineNumbers(content, 1, -1))
      continue
    }

    const ranges = args.files[relPath] ?? []
    for (const [start, end] of ranges) {
      parts.push('')
      parts.push(`#### ${relPath} [${start}-${end}]`)
      parts.push(renderWithLineNumbers(content, start, end))
    }
  }

  parts.push('')
  return parts.join('\n')
}

