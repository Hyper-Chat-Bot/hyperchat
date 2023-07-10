import { useParams } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import toast from 'src/components/Snackbar'
import { useCompany, useMessages, useSettings } from 'src/hooks'
import { streamDataState } from 'src/stores/conversation'
import { loadingState } from 'src/stores/global'
import { Role } from 'src/types/conversation'
import { LoadingType } from 'src/types/global'
import { OpenAIChatResponse, OpenAIError } from 'src/types/openai'

const useChatCompletion = (prompt: string) => {
  const { conversationId } = useParams()
  // const currConversation = useLiveQuery(() => {
  //   return db.conversations.where({ conversationId }).first()
  // }, [conversationId])
  const setStreamData = useSetRecoilState(streamDataState)
  const { settings } = useSettings()
  const company = useCompany()
  const { addMessage } = useMessages()
  const setLoading = useSetRecoilState(loadingState)

  const createChatCompletion = async () => {
    // if (!settings || !currConversation) return
    if (!settings) return
    await addMessage(prompt, Role.User)

    // const {
    //   model,
    //   system_message,
    //   max_tokens,
    //   temperature,
    //   top_p,
    //   frequency_penalty,
    //   presence_penalty,
    //   stop
    // } = currConversation.configuration as ChatConfiguration

    setLoading(LoadingType.FetchAssistantContent)

    let chat: Response | undefined

    try {
      chat = await company.chat_completion({
        messages: [
          // {
          //   role: Role.System,
          //   content: system_message
          // },
          {
            role: Role.User,
            content: prompt
          }
        ],
        // model,
        // max_tokens,
        // temperature,
        // top_p,
        // stop: stop.length > 0 ? stop : undefined,
        // frequency_penalty,
        // presence_penalty,
        model: 'gpt-3.5-turbo',
        stream: true
      })
    } catch {
      toast.error('Network Error.')
      setLoading(LoadingType.NoLoading)
      return
    }

    const reader = chat.body?.getReader()

    if (!reader) {
      toast.error('Cannot get ReadableStream.')
      setLoading(LoadingType.NoLoading)
      return
    }

    // The error which is throwing by OpenAI API.
    if (chat.status !== 200) {
      const { value } = await reader.read()
      const decoder = new TextDecoder('utf-8')
      const chunk = decoder.decode(value, { stream: true })
      const errorData: OpenAIError = JSON.parse(chunk)
      toast.error(errorData.error.message)
      setLoading(LoadingType.NoLoading)
      return
    }

    let _content = ''

    const decoder = new TextDecoder('utf-8')
    const read = async (): Promise<void> => {
      try {
        const { done, value } = await reader.read()

        if (done) {
          await addMessage(_content, Role.Assistant)
          setLoading(LoadingType.NoLoading)
          return reader.releaseLock()
        }

        const chunk = decoder.decode(value, { stream: true })
        const chunks: OpenAIChatResponse[] = chunk
          .split('data:')
          .map((data) => {
            const trimData = data.trim()
            if (trimData === '') return undefined
            if (trimData === '[DONE]') return undefined
            return JSON.parse(data.trim())
          })
          .filter((data) => data)
        chunks.forEach((data) => {
          const token = data.choices[0].delta.content

          if (token !== undefined) {
            _content += token
            setStreamData(_content)
          }
        })

        return read()
      } catch {
        toast.error('Stream data parsing error.')
      } finally {
        setLoading(LoadingType.NoLoading)
        setStreamData('')
      }
    }

    await read()
    reader.releaseLock()
  }

  return { createChatCompletion }
}

export default useChatCompletion
