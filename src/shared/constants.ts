import { SnackbarOrigin } from '@mui/material'
import { Products } from 'src/types/global'

export const OPENAI_BASE_URL = 'https://api.openai.com/v1'

export const OPENAI_CHAT_COMPLETION_URL = OPENAI_BASE_URL + '/chat/completions'

export const EMPTY_CHAT_HINT = 'Create your first conversation!'

export const TEXTAREA_MAX_ROWS = 8

export const SNACKBAR_ANCHOR_ORIGIN: SnackbarOrigin = {
  vertical: 'bottom',
  horizontal: 'left'
}

export const conversationTitles = {
  [Products.OpenAIChat]: 'OpenAI Chat Completion',
  [Products.OpenAITextCompletion]: 'OpenAI Text Completion',
  [Products.OpenAIAudioTranscription]: 'OpenAI Audio Transcription',
  [Products.OpenAIAudioTranslation]: 'OpenAI Audio Translation',
  [Products.OpenAIImageGeneration]: 'OpenAI Image Generation',
  [Products.AzureChat]: 'Azure Chat',
  [Products.AzureTextCompletion]: 'Azure Completion',
  [Products.AzureImageGeneration]: 'Azure Image Generation'
}

export const SNACKBAR_MAX_NUM = 1

export const SNACKBAR_AUTO_HIDE_DURATION = 3000
