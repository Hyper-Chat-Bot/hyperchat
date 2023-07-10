import { useLiveQuery } from 'dexie-react-hooks'
import { DateTime } from 'luxon'
import { ImagesResponse } from 'openai'
import { useParams } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { ImageGenerationConfiguration } from 'src/configurations/imageGeneration'
import { db } from 'src/db'
import { useCompany, useMessages } from 'src/hooks'
import { showErrorToast } from 'src/shared/utils'
import { loadingState } from 'src/stores/global'
import { settingsState } from 'src/stores/settings'
import { AzureImageGeneration } from 'src/types/azure'
import { Role } from 'src/types/conversation'
import { Companies, LoadingType } from 'src/types/global'
import { sleep } from 'yancey-js-util'

const useImageGeneration = (prompt: string) => {
  const { conversationId } = useParams()
  const currConversation = useLiveQuery(() => {
    return db.conversations.where({ conversationId }).first()
  }, [conversationId])
  const setLoading = useSetRecoilState(loadingState)
  const settings = useRecoilValue(settingsState)
  const company = useCompany()
  const { addMessage } = useMessages()

  const createOpenAIImageGeneration = async () => {
    if (!settings || !currConversation) return
    await addMessage(prompt, Role.User)

    const { n, size, response_format } =
      currConversation.configuration as ImageGenerationConfiguration

    try {
      setLoading(LoadingType.FetchAssistantContent)

      const response = await company.image_generation({
        prompt: prompt,
        n,
        size,
        response_format
      })
      const image = (await response.json()) as ImagesResponse

      const content = image.data
        .map((val, key) => `![${prompt}-${key}](${val.url})\n`)
        .join('')
      await addMessage(content, Role.Assistant)
    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoading(LoadingType.NoLoading)
    }
  }

  const createAzureImageGeneration = async () => {
    if (!settings || !currConversation) return
    await addMessage(prompt, Role.User)

    const { n, size } =
      currConversation.configuration as ImageGenerationConfiguration

    try {
      setLoading(LoadingType.FetchAssistantContent)

      const headers = {
        'Content-Type': 'application/json',
        'api-key': settings.azure_secret_key
      }

      const submission = await company.image_generation({
        prompt: prompt,
        n,
        size
      })

      const operation_location = submission.headers.get('Operation-Location')
      if (!operation_location) throw new Error('No Operation Location found.')
      let retry_after = Number(submission.headers.get('Retry-after')) * 1000
      let image: AzureImageGeneration | null = null

      while (image?.status !== 'succeeded') {
        sleep(retry_after)

        const response = await fetch(operation_location, {
          headers,
          method: 'GET'
        })
        retry_after = Number(response.headers.get('Retry-after')) * 1000
        image = (await response.json()) as AzureImageGeneration
      }

      let content = ''
      image.result.data.forEach(
        (image) => (content += `![${prompt}](${image.url})\n\n`)
      )
      content += `(Warning: The expiration date of this image is **${DateTime.fromSeconds(
        image.expires
      ).toLocaleString(
        DateTime.DATETIME_SHORT_WITH_SECONDS
      )}**, please download as soon as possible.)`
      await addMessage(content, Role.Assistant)
    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoading(LoadingType.NoLoading)
    }
  }

  return settings?.company === Companies.OpenAI
    ? { createImageGeneration: createOpenAIImageGeneration }
    : { createImageGeneration: createAzureImageGeneration }
}

export default useImageGeneration
