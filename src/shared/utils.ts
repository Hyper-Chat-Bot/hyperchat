import { isAxiosError } from 'axios'
import { DateTime } from 'luxon'
import toast from 'src/components/Snackbar'
import { Products, ThemeMode } from 'src/types/global'
import { OpenAIError } from 'src/types/openai'
import { v4 } from 'uuid'
import { getFileExtension } from 'yancey-js-util'

export const formatDate = (millis: number) => {
  const now = DateTime.now()
  const date = DateTime.fromMillis(millis)

  if (now.hasSame(date, 'day')) {
    return {
      isSameDay: true,
      display: date.toLocaleString(DateTime.TIME_24_SIMPLE)
    }
  }

  return { isSameDay: false, display: date.toLocaleString(DateTime.DATE_FULL) }
}

export const generateHashName = (fileName: string) => {
  const extension = getFileExtension(fileName)
  const hashName = `${v4()}_${+new Date()}.${extension}`

  return hashName
}

export const isAudioProduct = (product?: string | Products) =>
  product === Products.AudioTranscription ||
  product === Products.AudioTranslation

export const formatBytes = (bytes: number) => {
  const k = 1024
  const sizes = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB'
  ]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const themeModeToTheme = (themeMode?: ThemeMode) =>
  themeMode === ThemeMode.system || !themeMode
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? ThemeMode.dark
      : ThemeMode.light
    : themeMode

export const showErrorToast = (error: unknown) => {
  if (isAxiosError<OpenAIError, Record<string, unknown>>(error)) {
    toast.error(error.response?.data.error.message || '')
  } else {
    toast.error(JSON.stringify(error))
  }
}
