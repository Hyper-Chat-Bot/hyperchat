import classNames from 'classnames'
import { produce } from 'immer'
import { FC, useEffect, useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { useModifyDocument } from 'src/hooks'
import { EMPTY_MESSAGE_ID } from 'src/shared/constants'
import { chatsState, currChatIdState, currChatState } from 'src/stores/chat'
import { OpenAIChatResponse } from 'src/types/chat'
import { BoldSendIcon, LinearPaperclipIcon } from '../Icons'

const InputBox: FC = () => {
  const [question, setQuestion] = useState('')
  const currChatId = useRecoilValue(currChatIdState)
  const currChat = useRecoilValue(currChatState)
  const [isStreaming, setIsStreaming] = useState(false)
  const setChats = useSetRecoilState(chatsState)
  const { modifyDocument } = useModifyDocument('chat')

  const onEnterPress = (e: globalThis.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  const onSearch = async () => {
    if (question.trim().length === 0) return

    setIsStreaming(true)

    // Append an empty message object to show loading spin.
    setChats((prevState) => {
      const currState = produce(prevState, (draft) => {
        const currChat = draft.find((chat) => chat.chat_id === currChatId)

        if (currChat) {
          currChat.messages.push({
            message_id: EMPTY_MESSAGE_ID,
            answer: '',
            question,
            created_at: +new Date()
          })
        }
      })

      return currState
    })

    setQuestion('')

    const completion = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        method: 'POST',
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: question
            }
          ],
          model: 'gpt-3.5-turbo',
          stream: true
        })
      }
    )

    const reader = completion.body?.getReader()

    if (completion.status !== 200 || !reader) {
      return 'error'
    }

    const decoder = new TextDecoder('utf-8')
    try {
      const read = async (): Promise<any> => {
        const { done, value } = await reader.read()

        if (done) return reader.releaseLock()

        const chunk = decoder.decode(value, { stream: true })
        const jsons: OpenAIChatResponse[] = chunk
          .split('data:')
          .map((data) => {
            const trimData = data.trim()
            if (trimData === '') return undefined
            if (trimData === '[DONE]') {
              setIsStreaming(false)

              return undefined
            }
            return JSON.parse(data.trim())
          })
          .filter((data) => data)

        jsons.forEach((json) => {
          const token = json.choices[0].delta.content

          if (token !== undefined) {
            setChats((prevState) => {
              const currState = produce(prevState, (draft) => {
                const currChat = draft.find(
                  (chat) => chat.chat_id === currChatId
                )

                if (currChat) {
                  const messages = currChat.messages
                  const last = messages[messages.length - 1]
                  const isFirstChuck = last.message_id === EMPTY_MESSAGE_ID

                  if (isFirstChuck) {
                    last.message_id = json.id
                  }

                  last.answer += token
                }
              })

              return currState
            })
          }
        })

        return read()
      }

      await read()
    } catch (e) {
      console.error(e)
    }

    reader.releaseLock()
  }

  useEffect(() => {
    if (!isStreaming && currChat && currChat.messages.length > 0) {
      modifyDocument(
        {
          chat_id: currChatId
        },
        {
          messages: currChat.messages
        }
      )
    }
  }, [isStreaming, currChat])

  useEffect(() => {
    document.addEventListener('keyup', onEnterPress)

    return () => {
      document.removeEventListener('keyup', onEnterPress)
    }
  }, [])

  return (
    <section className="absolute bottom-6 left-6 flex w-[calc(100%_-_3rem)] items-center bg-white pt-6 dark:bg-dark-main-bg">
      <LinearPaperclipIcon className="mr-6" />
      <section className="relative flex w-full">
        <input
          value={question}
          type="text"
          className="flex-1 rounded-xl border-2 border-main-gray pb-3.5 pl-5 pr-5 pt-3.5 text-sm text-black text-opacity-40 outline-none dark:border-dark-search-input-border dark:bg-dark-search-input dark:text-dark-text-sub"
          placeholder="Type a message"
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div onClick={onSearch}>
          <BoldSendIcon
            className="absolute right-5 top-3.5"
            pathClassName={classNames(
              'text-black dark:text-white fill-current transition duration-250 ease-in-out',
              {
                'text-opacity-30': question.trim().length === 0,
                'text-main-purple dark:text-main-purple transition duration-250 ease-in-out':
                  question.trim().length > 0
              }
            )}
          />
        </div>
      </section>
    </section>
  )
}

export default InputBox
