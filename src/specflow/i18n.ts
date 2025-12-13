import type { Language } from '../../shared/appDataTypes'

type Dict = Record<string, string>

const EN: Dict = {
  toolbar_hand: 'Hand Mode',
  toolbar_hand_desc: 'Pan and navigate around the canvas by clicking and dragging',
  toolbar_select: 'Select Mode',
  toolbar_select_desc: 'Click to select nodes, or drag to create a selection box',
  toolbar_code_search: 'Code Search',
  toolbar_code_search_desc: 'Search through your codebase to find relevant code snippets',
  toolbar_search_conductor: 'Search Conductor',
  toolbar_search_conductor_desc: 'Orchestrate multiple code searches in parallel',
  toolbar_context: 'Context Converter',
  toolbar_context_desc: 'Convert code search results into formatted context for LLM',
  toolbar_instruction: 'Instruction',
  toolbar_instruction_desc: 'Add custom instructions or prompts to guide the workflow',
  toolbar_llm: 'LLM',
  toolbar_llm_desc: 'Process context through a language model to generate responses',
  toolbar_reset: 'Reset Canvas',
  toolbar_reset_desc: 'Clear all node outputs and reset the canvas to idle state',

  settings: 'Settings',
  settings_title: 'Settings',
  language: 'Language',
  language_en: 'English',
  language_zh: '中文',

  settings_tab_llm: 'LLM Providers',
  settings_tab_codesearch: 'Code Search',

  providers: 'Providers',
  add: '+ Add',
  provider_name: 'Provider Name',
  endpoint: 'Endpoint URL',
  api_key: 'API Key',
  models: 'Models',
  add_model: '+ Add Model',
  new_model: 'New Model',
  model_id: 'Model ID',
  display_name: 'Display Name',
  no_models_configured: 'No models configured',
  remove_provider: 'Remove Provider',
  no_providers_configured: 'No LLM providers configured.',
  new_provider: 'New Provider',
  add_provider: '+ Add Provider',

  active_provider: 'Active Provider',
  api_key_for_provider: 'API Key',
  enter_api_key_placeholder: 'Enter API key...',
  codesearch_note:
    'Currently only Relace is supported for code search. If no API key is provided here, the server will fall back to reading from the .apikey file.',

  cancel: 'Cancel',
  save_settings: 'Save',
  close: 'Close',
}

const ZH: Dict = {
  toolbar_hand: '手形模式',
  toolbar_hand_desc: '拖动平移画布（按住鼠标左键拖拽）',
  toolbar_select: '选择模式',
  toolbar_select_desc: '点击选择节点，或拖拽进行框选',
  toolbar_code_search: '代码搜索',
  toolbar_code_search_desc: '在代码库中搜索相关代码片段',
  toolbar_search_conductor: '搜索编排',
  toolbar_search_conductor_desc: '并行编排多个代码搜索查询',
  toolbar_context: '上下文转换',
  toolbar_context_desc: '把搜索结果转换为 LLM 可用的上下文文本',
  toolbar_instruction: '指令',
  toolbar_instruction_desc: '添加自定义指令/提示来引导工作流',
  toolbar_llm: 'LLM',
  toolbar_llm_desc: '把上下文交给模型生成输出',
  toolbar_reset: '重置画布',
  toolbar_reset_desc: '清空所有节点输出并重置为 idle 状态',

  settings: '设置',
  settings_title: '设置',
  language: '语言',
  language_en: 'English',
  language_zh: '中文',

  settings_tab_llm: 'LLM 提供方',
  settings_tab_codesearch: '代码搜索',

  providers: '提供方',
  add: '+ 添加',
  provider_name: '提供方名称',
  endpoint: 'Endpoint URL',
  api_key: 'API Key',
  models: '模型',
  add_model: '+ 添加模型',
  new_model: '新模型',
  model_id: '模型 ID',
  display_name: '展示名称',
  no_models_configured: '暂无模型配置',
  remove_provider: '移除提供方',
  no_providers_configured: '暂无 LLM 提供方配置。',
  new_provider: '新提供方',
  add_provider: '+ 添加提供方',

  active_provider: '当前提供方',
  api_key_for_provider: 'API Key',
  enter_api_key_placeholder: '输入 API Key...',
  codesearch_note:
    '目前代码搜索仅支持 Relace。如果这里没有填写 API Key，后端会回退到读取 .apikey 文件。',

  cancel: '取消',
  save_settings: '保存',
  close: '关闭',
}

function getDict(language: Language): Dict {
  if (language === 'en') return EN
  if (language === 'zh') return ZH
  throw new Error(`Unsupported language: ${language}`)
}

export function t(language: Language, key: string): string {
  const dict = getDict(language)
  const value = dict[key]
  if (typeof value !== 'string') throw new Error(`Missing i18n key: ${key} (lang=${language})`)
  return value
}
