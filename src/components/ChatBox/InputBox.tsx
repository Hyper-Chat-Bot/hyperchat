import { MicrophoneIcon } from '@heroicons/react/24/solid'
import Input from '@mui/material/Input'
import Tooltip from '@mui/material/Tooltip'
import classNames from 'classnames'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChangeEvent, FC, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { db } from 'src/db'
import { useAppData, useRequest } from 'src/hooks'
import { isAudioProduct } from 'src/shared/utils'
import { loadingState } from 'src/stores/global'
import { HashFile } from 'src/types/conversation'
import { Products } from 'src/types/global'
import Divider from '../Divider'
import { SolidSendIcon } from '../Icons'

const InputBox: FC = () => {
  const { product, conversationId } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const currConversation = useLiveQuery(() => {
    return db.conversations.where({ conversationId }).first()
  }, [conversationId])
  const loading = useRecoilValue(loadingState)
  const { saveFileToAppDataDir } = useAppData()
  const [prompt, setPrompt] = useState('')
  const [hashFile, setHashFile] = useState<HashFile | null>(null)
  const requests = useRequest(prompt, hashFile as HashFile)

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]

    if (file) {
      const hashName = await saveFileToAppDataDir(file)
      setHashFile({
        file,
        hashName
      })
    }
  }

  const resetInput = () => {
    setPrompt('')
    setHashFile(null)

    if (textareaRef.current) {
      textareaRef.current.blur()
      textareaRef.current.value = ''
    }
  }

  // Prompt is optional in audio products.
  const validate = () => {
    if (isAudioProduct(product)) {
      return Boolean(hashFile)
    } else {
      return prompt.trim().length !== 0
    }
  }

  const handleRequest = () => {
    if (loading) return
    if (!validate()) return

    // FIXME: How to declare this via type guard?
    requests[product as Products]()
    resetInput()
  }

  // FIXME: I cannot declare the type of `event` correctly.
  // @ts-ignore
  const handleKeyDown = (event) => {
    if ((event.keyCode === 13 || event.key === 'Enter') && event.shiftKey) {
      const start = event.target.selectionStart
      const end = event.target.selectionEnd
      const value = event.target.value

      setPrompt(value.substring(0, start) + '\n' + value.substring(end))
      event.target.selectionStart = event.target.selectionEnd = start + 1
      event.preventDefault()
    }

    if ((event.keyCode === 13 || event.key === 'Enter') && !event.shiftKey) {
      handleRequest()
      event.preventDefault()
    }
  }

  if (!currConversation) return null

  return (
    <section className="absolute bottom-6 left-6 w-[calc(100%_-_3rem)] bg-white pt-6 dark:bg-gray-800">
      <section className="relative flex w-full">
        <Input
          inputRef={textareaRef}
          className="max-h-52 overflow-scroll rounded-md border border-black/10 bg-white text-sm shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-gray-900/50 dark:bg-gray-700 dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]"
          placeholder="Send a message."
          multiline
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disableUnderline
          fullWidth
          sx={{
            paddingTop: 1.5,
            paddingRight: 2,
            paddingBottom: 1.5,
            paddingLeft: 2
          }}
        />

        <section className="absolute bottom-3.5 right-4 z-10 flex gap-3">
          {isAudioProduct(product) && (
            <>
              <label
                htmlFor="$$video-input"
                className="relative flex cursor-pointer items-center"
              >
                <input
                  type="file"
                  id="$$video-input"
                  accept="audio/mp3,video/mp4,video/mpeg,video/mpea,video/m4a,video/wav,video/webm"
                  className="absolute h-6 w-6 opacity-0 file:h-6 file:w-6"
                  ref={fileInputRef}
                  onChange={onFileChange}
                />
                <Tooltip
                  title={hashFile?.file.name || ''}
                  placement="top"
                  open={Boolean(hashFile?.file.name)}
                >
                  <MicrophoneIcon
                    className={classNames(
                      'relative h-5 w-5',
                      {
                        'text-black text-opacity-30 dark:text-white':
                          !validate()
                      },
                      {
                        'text-main-purple text-opacity-100 dark:text-main-purple':
                          validate()
                      }
                    )}
                  />
                </Tooltip>
              </label>
              <Divider direction="vertical" className="h-6" />
            </>
          )}

          <SolidSendIcon
            onClick={handleRequest}
            pathClassName={classNames(
              'fill-current',
              {
                'text-black dark:text-white text-opacity-30': !validate()
              },
              {
                'text-main-purple dark:text-main-purple text-opacity-100':
                  validate()
              }
            )}
          />
        </section>
      </section>
    </section>
  )
}

export default InputBox
