import { readFile } from 'node:fs/promises'
import path from 'node:path'

async function readKeyFromDotfile() {
  const keyPath = path.join(process.cwd(), '.llmkey')
  const key = (await readFile(keyPath, 'utf-8')).trim()
  if (!key) throw new Error('Empty .llmkey')
  return key
}

export async function runOpenRouterChat(args: {
  model: string
  systemPrompt: string
  userPrompt: string
}) {
  const apiKey = await readKeyFromDotfile()
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'SpecFlow',
    },
    body: JSON.stringify({
      model: args.model,
      messages: [
        { role: 'system', content: args.systemPrompt },
        { role: 'user', content: args.userPrompt },
      ],
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`OpenRouter error: ${JSON.stringify(data)}`)
  }

  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new Error(`Unexpected OpenRouter response: ${JSON.stringify(data)}`)
  }
  return content
}

