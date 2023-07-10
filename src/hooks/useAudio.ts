import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { AudioTranscriptionConfiguration } from 'src/configurations/audioTranscription'
import { AudioTranslationConfiguration } from 'src/configurations/audioTranslation'
import { db } from 'src/db'
import { useMessages, useOpenAI } from 'src/hooks'
import { showErrorToast } from 'src/shared/utils'
import { loadingState } from 'src/stores/global'
import { settingsState } from 'src/stores/settings'
import { HashFile, Role } from 'src/types/conversation'
import { LoadingType } from 'src/types/global'

const useAudio = (prompt: string, hashFile: HashFile | null) => {
  const { conversationId } = useParams()
  const currConversation = useLiveQuery(() => {
    return db.conversations.where({ conversationId }).first()
  }, [conversationId])
  const settings = useRecoilValue(settingsState)
  const setLoading = useSetRecoilState(loadingState)
  const openai = useOpenAI()
  const { addMessage } = useMessages()

  const createTranscription = async () => {
    if (!hashFile || !settings || !currConversation) return
    await addMessage(prompt, Role.User)

    const { model, temperature, language, response_format } =
      currConversation.configuration as AudioTranscriptionConfiguration

    try {
      setLoading(LoadingType.FetchUserContent)

      const transcription = await openai.createTranscription(
        hashFile.file,
        model,
        prompt,
        response_format,
        temperature,
        language === '' ? undefined : language
      )
      await addMessage(
        // If `response_format` is `json` or `verbose_json`, the result is `transcription.data.text`.
        // If `response_format` is `text`, `vtt` `or `srt`, the result is `transcription.data`.
        transcription.data.text || (transcription.data as unknown as string),
        Role.Assistant
      )
    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoading(LoadingType.NoLoading)
    }
  }

  const createTranslation = async () => {
    if (!hashFile || !settings || !currConversation) return

    const { model, temperature, response_format } =
      currConversation.configuration as AudioTranslationConfiguration

    try {
      setLoading(LoadingType.FetchAssistantContent)

      const translation = await openai.createTranslation(
        hashFile.file,
        model,
        prompt,
        response_format,
        temperature
      )
      await addMessage(
        // If `response_format` is `json` or `verbose_json`, the result is `transcription.data.text`.
        // If `response_format` is `text`, `vtt` `or `srt`, the result is `transcription.data`.
        translation.data.text || (translation.data as unknown as string),
        Role.Assistant
      )
    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoading(LoadingType.NoLoading)
    }
  }

  return { createTranslation, createTranscription }
}

export default useAudio
