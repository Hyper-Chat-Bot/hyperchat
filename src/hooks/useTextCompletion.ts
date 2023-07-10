import { useLiveQuery } from 'dexie-react-hooks'
import { CreateCompletionResponse } from 'openai'
import { useParams } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { TextCompletionConfiguration } from 'src/configurations/textCompletion'
import { db } from 'src/db'
import { useCompany, useMessages } from 'src/hooks'
import { showErrorToast } from 'src/shared/utils'
import { loadingState } from 'src/stores/global'
import { settingsState } from 'src/stores/settings'
import { Role } from 'src/types/conversation'
import { LoadingType } from 'src/types/global'

const useTextCompletion = (prompt: string) => {
  const { conversationId } = useParams()
  const currConversation = useLiveQuery(() => {
    return db.conversations.where({ conversationId }).first()
  }, [conversationId])
  const setLoading = useSetRecoilState(loadingState)
  const settings = useRecoilValue(settingsState)
  const company = useCompany()
  const { addMessage } = useMessages()

  const createTextCompletion = async () => {
    if (!settings || !currConversation) return
    await addMessage(prompt, Role.User)

    const {
      model,
      max_tokens,
      temperature,
      top_p,
      frequency_penalty,
      presence_penalty,
      pre_response_text,
      post_response_text
    } = currConversation.configuration as TextCompletionConfiguration

    try {
      setLoading(LoadingType.FetchAssistantContent)

      const response = await company.text_completion({
        model,
        prompt: prompt,
        max_tokens,
        temperature,
        top_p,
        frequency_penalty,
        presence_penalty
      })
      const completion: CreateCompletionResponse = await response.json()

      const preResponseText = pre_response_text.checked
        ? pre_response_text.content
        : ''
      const postResponseText = post_response_text.checked
        ? post_response_text.content
        : ''

      await addMessage(
        preResponseText + (completion.choices[0].text || '') + postResponseText,
        Role.Assistant
      )
    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoading(LoadingType.NoLoading)
    }
  }

  return { createTextCompletion }
}

export default useTextCompletion
