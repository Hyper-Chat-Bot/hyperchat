import { useParams } from 'react-router-dom'
import { db } from 'src/db'
import { Role } from 'src/types/conversation'
import { v4 } from 'uuid'

const useMessages = () => {
  const { conversationId } = useParams()

  const addMessage = async (content: string, role: Role) => {
    if (!conversationId) {
      return
    }

    await db.messages.add({
      messageId: v4(),
      conversationId,
      role,
      content,
      createdAt: +new Date()
    })
  }

  return {
    addMessage
  }
}

export default useMessages
