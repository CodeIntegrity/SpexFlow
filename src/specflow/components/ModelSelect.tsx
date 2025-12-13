import type { APISettings, LLMModel } from '../types'

type Props = {
  value: string
  onChange: (modelId: string) => void
  settings: APISettings
  disabled?: boolean
  label?: string
  selectPlaceholder?: string
  noModelsPlaceholder?: string
}

export function ModelSelect({
  value,
  onChange,
  settings,
  disabled,
  label = 'Model',
  selectPlaceholder = 'Select a model...',
  noModelsPlaceholder = 'No models configured - open Settings to add',
}: Props) {
  // Flatten all models from all providers with provider context
  const allModels: Array<{ model: LLMModel; providerName: string }> = []

  for (const provider of settings.llm.providers) {
    for (const model of provider.models) {
      allModels.push({ model, providerName: provider.name })
    }
  }

  if (allModels.length === 0) {
    return (
      <div className="sfFieldGroup">
        <label className="sfFieldLabel">{label}</label>
        <input
          className="sfInput"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={noModelsPlaceholder}
        />
      </div>
    )
  }

  // Group models by provider for optgroup display
  const providerGroups = settings.llm.providers.filter(p => p.models.length > 0)

  return (
    <div className="sfFieldGroup">
      <label className="sfFieldLabel">{label}</label>
      <select
        className="sfSelect"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{selectPlaceholder}</option>
        {providerGroups.map(provider => (
          <optgroup key={provider.id} label={provider.name}>
            {provider.models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}
