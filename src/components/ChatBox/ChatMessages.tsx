import classNames from 'classnames'
import { useLiveQuery } from 'dexie-react-hooks'
import { FC, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import ChatGPTLogoImg from 'src/assets/chatbot.png'
import NoDataIllustration from 'src/assets/illustrations/no-data.svg'
import { db } from 'src/db'
import { useSettings } from 'src/hooks'
import { isAudioProduct } from 'src/shared/utils'
import { streamDataState } from 'src/stores/conversation'
import { loadingState } from 'src/stores/global'
import { Role } from 'src/types/conversation'
import { LoadingType } from 'src/types/global'
import Waveform from '../Waveform'
import ChatBubble from './ChatBubble'
import Markdown from './Markdown'
import MessageSpinner from './MessageSpinner'

const ChatMessages: FC = () => {
  const { conversationId, product } = useParams()
  const messages = useLiveQuery(
    () => db.messages.where({ conversationId }).sortBy('createdAt'),
    [conversationId]
  )
  const chatBoxRef = useRef<HTMLDivElement>(null)
  const loading = useRecoilValue(loadingState)
  const streamData = useRecoilValue(streamDataState)
  const { settings } = useSettings()
  const hasMessages = messages && messages.length > 0

  const getAvatar = (role: Role) =>
    role === Role.Assistant
      ? settings?.assistant_avatar_filename
        ? settings.assistant_avatar_filename
        : ChatGPTLogoImg
      : ''

  const scrollToBottom = () => {
    if (!chatBoxRef.current) return
    const $el = chatBoxRef.current

    if ($el.scrollHeight > $el.scrollTop + $el.clientHeight + 24) {
      $el.scrollTo({
        top: $el.scrollHeight,
        left: 0
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <section
      className={classNames(
        'no-scrollbar relative h-[calc(100vh_-_8.25rem)] overflow-y-scroll p-6',
        { 'flex items-center justify-center': !hasMessages }
      )}
      ref={chatBoxRef}
    >
      {hasMessages ? (
        <>
          {messages.map((message) => (
            <ChatBubble
              key={message.messageId}
              role={message.role}
              avatar={getAvatar(message.role)}
              date={message.createdAt}
            >
              {isAudioProduct(product) && message.fileName && (
                <Waveform filename={message.fileName} />
              )}
              {message.role === 'assistant' ? (
                <Markdown raw={message.content} />
              ) : (
                message.content
              )}
            </ChatBubble>
          ))}

          {/* {(loading === LoadingType.FetchAssistantContent ||
            loading === LoadingType.FetchUserContent) && ( */}
            <ChatBubble
              role={Role.Assistant}
              avatar={getAvatar(Role.Assistant)}
            >
              {streamData ? <Markdown raw={streamData} /> : <MessageSpinner />}
            </ChatBubble>
          {/* )} */}
        </>
      ) : (
        <img
          src={NoDataIllustration}
          alt="NoDataIllustration"
          className="h-96 w-96 dark:opacity-80"
        />
      )}
    </section>
  )
}

export default ChatMessages
