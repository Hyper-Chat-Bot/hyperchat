import { AudioTranscriptionConfiguration } from '../configurations/audioTranscription'
import { AudioTranslationConfiguration } from '../configurations/audioTranslation'
import { ChatConfiguration } from '../configurations/chat'
import { ImageGenerationConfiguration } from '../configurations/imageGeneration'
import { TextCompletionConfiguration } from '../configurations/textCompletion'
import { Products } from './global'

export interface Message {
  message_id: string
  question: string
  answer: string
  question_created_at: number
  answer_created_at: number
  file_name?: string
}

export interface Conversation {
  conversation_id: string
  summary: string
  avatar: string
  created_at: number
  updated_at: number
  messages: Message[]
  configuration:
    | ChatConfiguration
    | ImageGenerationConfiguration
    | AudioTranscriptionConfiguration
    | AudioTranslationConfiguration
    | TextCompletionConfiguration
}

export type EmptyMessageParams = Pick<Message, 'question' | 'file_name'>

export interface _Conversation {
  conversationId: string
  summary: string
  avatar: string
  product: Products
  createdAt: number
  updatedAt: number
  configuration:
    | ChatConfiguration
    | ImageGenerationConfiguration
    | AudioTranscriptionConfiguration
    | AudioTranslationConfiguration
    | TextCompletionConfiguration
}

export interface _Message {
  messageId: string
  conversationId: string
  role: Role
  content: string
  fileName?: string
  createdAt: number
}

export interface _ConversationWithLatestMessage extends _Conversation {
  latestMessage: _Message | null
}

export interface HashFile {
  file: File
  hashName: string
  src?: string
}

export enum Role {
  System = 'system',
  User = 'user',
  Assistant = 'assistant'
}
