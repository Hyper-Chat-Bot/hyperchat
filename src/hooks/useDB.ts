import { db } from 'src/db'

const useDB = (tableName: string) => {
  const deleteOneById = async (id: string) => {
    try {
      await db.table(tableName).delete(id)
    } catch {}
  }

  const toArray = async <T>() => {
    try {
      const array = (await db.table(tableName).toArray()) as T
      return array
    } catch {}
  }

  const updateOneById = async (id: string, data: any) => {
    try {
      await db.table(tableName).update(id, data)
    } catch {}
  }

  const insertOne = async (data: any) => {
    try {
      await db.table(tableName).add(data)
    } catch {}
  }

  const getOneById = async <T>(id: string) => {
    try {
      const data = (await db.table(tableName).get(id)) as T
      return data
    } catch {}
  }

  const getConversationsWithLatestMessage = async () => {
    const conversations = await db.conversations.toArray()

    const latestMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const messages = await db.messages
          .where('conversationId')
          .equals(conversation.conversationId)
          .reverse() // Reverse the order to get the latest message first.
          .limit(1) // Limit the result to the latest message only
          .toArray()

        if (messages.length > 0) {
          return messages[0]
        }
        return null
      })
    )

    const conversationsWithLatestMessage = conversations.map(
      (conversation, index) => {
        const latestMessage = latestMessages[index]

        return {
          ...conversation,
          latestMessage
        }
      }
    )

    // Sort conversations based on the timestamp of the latest message or conversation creation time
    conversationsWithLatestMessage.sort((a, b) => {
      const aTime = a.latestMessage ? a.latestMessage.createdAt : a.updatedAt
      const bTime = b.latestMessage ? b.latestMessage.createdAt : b.updatedAt
      return bTime - aTime
    })

    return conversationsWithLatestMessage
  }

  return {
    getConversationsWithLatestMessage,
    deleteOneById,
    toArray,
    updateOneById,
    insertOne,
    getOneById
  }
}

export default useDB
