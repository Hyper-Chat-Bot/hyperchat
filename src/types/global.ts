import { Role } from './conversation'

export type Dict = { [index: string]: string }

export interface SvgIconProps {
  width?: number
  height?: number
  className?: string
  pathClassName?: string
  onClick?: () => void
}

export enum Companies {
  OpenAI = 'OpenAI',
  Azure = 'Azure'
}

export enum Products {
  ChatCompletion = 'chat_completion',
  TextCompletion = 'text_completion',
  AudioTranscription = 'audio_transcription',
  AudioTranslation = 'audio_translation',
  ImageGeneration = 'image_generation'
}

export interface AlertError {
  code: number
  message: string
}

export interface EmojiPickerProps {
  emoticons: string[]
  id: string
  keywords: string[]
  name: string
  native: string
  shortcodes: string
  unified: string
}

export enum ThemeMode {
  light = 'light',
  system = 'system',
  dark = 'dark'
}

export enum LoadingType {
  NoLoading,
  FetchUserContent = Role.User,
  FetchAssistantContent = Role.Assistant
}
