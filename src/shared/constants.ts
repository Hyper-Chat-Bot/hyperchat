export const EMPTY_MESSAGE_ID = '$$EMPTY_MESSAGE_ID'

export const OPENAI_BASE_URL = 'https://api.openai.com/v1'

export const OPENAI_CHAT_COMPLTION_URL = OPENAI_BASE_URL + '/chat/completions'

export const OPENAI_API_KEY = `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`