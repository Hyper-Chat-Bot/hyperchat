import {
  useAudio,
  useChatCompletion,
  useImageGeneration,
  useTextCompletion
} from 'src/hooks'
import { HashFile } from 'src/types/conversation'
import { Products } from 'src/types/global'

const useRequest = (prompt: string, hashFile: HashFile) => {
  const { createChatCompletion } = useChatCompletion(prompt)
  const { createTextCompletion } = useTextCompletion(prompt)
  const { createImageGeneration } = useImageGeneration(prompt)
  const { createTranscription, createTranslation } = useAudio(prompt, hashFile)

  const requests = {
    [Products.ChatCompletion]: createChatCompletion,
    [Products.TextCompletion]: createTextCompletion,
    [Products.AudioTranscription]: createTranscription,
    [Products.AudioTranslation]: createTranslation,
    [Products.ImageGeneration]: createImageGeneration
  }

  return requests
}

export default useRequest
