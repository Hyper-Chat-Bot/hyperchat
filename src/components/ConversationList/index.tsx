import { capitalCase } from 'change-case'
import { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { configurations } from 'src/configurations'
import { ChatConfiguration } from 'src/configurations/chat'
import { db } from 'src/db'
import {
  _Conversation,
  _ConversationWithLatestMessage
} from 'src/types/conversation'
import { Products } from 'src/types/global'
import { v4 } from 'uuid'
import Divider from '../Divider'
import { OutlinePlusIcon } from '../Icons'
import ConversationItem from './ConversationItem'
import ChatEmpty from './EmptyItem'

interface Props {
  conversations: _ConversationWithLatestMessage[]
}

const ConversationList: FC<Props> = ({ conversations }) => {
  const navigate = useNavigate()
  const { conversationId, product } = useParams()

  const addConversation = async () => {
    const conversationId = v4()

    const conversation: _Conversation = {
      conversationId: conversationId,
      summary: '',
      avatar: '',
      product: Products.ChatCompletion,
      createdAt: +new Date(),
      updatedAt: +new Date(),
      configuration: configurations[product as Products]
        .default as ChatConfiguration
    }

    await db.conversations.add(conversation)
    navigate(`/p/${Products.ChatCompletion}/c/${conversationId}`, {
      replace: true
    })
  }

  const switchChat = (conversationId: string) => {
    navigate(`/p/${Products.ChatCompletion}/c/${conversationId}`, {
      replace: true
    })
  }

  return (
    <section className="w-87.75">
      <section className="flex items-center justify-between p-6">
        <span className="mr-4 truncate text-xl font-semibold dark:text-dark-text">
          {capitalCase(product || '')}
        </span>
        <OutlinePlusIcon onClick={addConversation} />
      </section>

      <Divider />

      <section className="no-scrollbar m-4 h-[calc(100vh_-_7.5625rem)] overflow-y-scroll">
        {conversations?.length > 0 ? (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.conversationId}
              active={conversation.conversationId === conversationId}
              conversation={conversation}
              onClick={() => switchChat(conversation.conversationId)}
            />
          ))
        ) : (
          <ChatEmpty onClick={addConversation} />
        )}
      </section>
    </section>
  )
}

export default ConversationList
