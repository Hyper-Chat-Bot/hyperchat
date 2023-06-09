import { useRecoilValue, useSetRecoilState } from 'recoil'
import { AudioTranscriptionConfiguration } from 'src/configurations/audioTranscription'
import { AudioTranslationConfiguration } from 'src/configurations/audioTranslation'
import { useMessages, useOpenAI } from 'src/hooks'
import { showErrorToast } from 'src/shared/utils'
import { currConversationState, loadingState } from 'src/stores/conversation'
import { settingsState } from 'src/stores/settings'
import { HashFile } from 'src/types/global'

const useOpenAIAudio = (question: string, hashFile: HashFile | null) => {
  const currConversation = useRecoilValue(currConversationState)
  const settings = useRecoilValue(settingsState)
  const setLoading = useSetRecoilState(loadingState)
  const openai = useOpenAI()
  const {
    pushEmptyMessage,
    saveMessageToDbAndUpdateConversationState,
    rollBackEmptyMessage
  } = useMessages()

  const createTranscription = async () => {
    if (!hashFile || !settings || !currConversation) return

    const { model, temperature, language, response_format } =
      currConversation.configuration as AudioTranscriptionConfiguration

    try {
      setLoading(true)

      const emptyMessage = pushEmptyMessage({
        question,
        file_name: hashFile.hashName
      })

      const transcription = await openai.createTranscription(
        hashFile.file,
        model,
        question,
        response_format,
        temperature,
        language
      )

      saveMessageToDbAndUpdateConversationState(
        emptyMessage,
        transcription.data.text
      )
    } catch (error) {
      showErrorToast(error)
      rollBackEmptyMessage()
    } finally {
      setLoading(false)
    }
  }

  const createTranslation = async () => {
    if (!hashFile || !settings || !currConversation) return

    const { model, temperature, response_format } =
      currConversation.configuration as AudioTranslationConfiguration

    try {
      setLoading(true)

      const emptyMessage = pushEmptyMessage({
        question,
        file_name: hashFile.hashName
      })

      const translation = await openai.createTranslation(
        hashFile.file,
        model,
        question,
        response_format,
        temperature
      )

      saveMessageToDbAndUpdateConversationState(
        emptyMessage,
        translation.data.text
      )
    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoading(false)
    }
  }

  return { createTranslation, createTranscription }
}

export default useOpenAIAudio
