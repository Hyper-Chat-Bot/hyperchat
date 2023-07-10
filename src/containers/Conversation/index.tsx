import { useLiveQuery } from 'dexie-react-hooks'
import { FC, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatBox from 'src/components/ChatBox'
import ConversationList from 'src/components/ConversationList'
import Divider from 'src/components/Divider'
import Loading from 'src/components/Loading'
import { useDB } from 'src/hooks'
import { EMPTY_CONVERSATION_ID } from 'src/shared/constants'
import { Products } from 'src/types/global'

const Conversation: FC = () => {
  const { product } = useParams()
  const navigate = useNavigate()
  const { getConversationsWithLatestMessage } = useDB('')
  const conversations = useLiveQuery(getConversationsWithLatestMessage, [])
  // const Configuration = configurations[product as Products].component()

  useEffect(() => {
    if (conversations) {
      navigate(
        `/p/${Products.ChatCompletion}/c/${
          conversations[0]?.conversationId || EMPTY_CONVERSATION_ID
        }`,
        {
          replace: true
        }
      )
    }
  }, [conversations])

  if (!conversations) return <Loading />

  return (
    <>
      <ConversationList conversations={conversations} />
      <Divider direction="vertical" />
      <ChatBox />
      {/* <Configuration /> */}
    </>
  )
}

export default Conversation
