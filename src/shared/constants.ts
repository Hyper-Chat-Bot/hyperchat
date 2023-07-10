import { SnackbarOrigin } from '@mui/material'

export const OPENAI_BASE_URL = 'https://api.openai.com/v1'

export const OPENAI_CHAT_COMPLETION_URL = OPENAI_BASE_URL + '/chat/completions'

export const OPENAI_TEXT_COMPLETION_URL = OPENAI_BASE_URL + '/completions'

export const OPENAI_IMAGE_GENERATION_URL =
  OPENAI_BASE_URL + '/images/generations'

export const EMPTY_CHAT_HINT = 'Create your first conversation!'

export const TEXTAREA_MAX_ROWS = 8

export const SNACKBAR_ANCHOR_ORIGIN: SnackbarOrigin = {
  vertical: 'bottom',
  horizontal: 'left'
}

export const SNACKBAR_MAX_NUM = 1

export const SNACKBAR_AUTO_HIDE_DURATION = 3000

export const EMPTY_CONVERSATION_ID = '$$EMPTY_CONVERSATION_ID'