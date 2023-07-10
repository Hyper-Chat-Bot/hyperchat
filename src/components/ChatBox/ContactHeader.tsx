import { AdjustmentsVerticalIcon } from '@heroicons/react/24/outline'
import {
  CheckIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/solid'
import Input from '@mui/material/Input'
import classNames from 'classnames'
import { useLiveQuery } from 'dexie-react-hooks'
import { FC, KeyboardEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import ChatGPTLogoImg from 'src/assets/chatbot.png'
import { db } from 'src/db'
import { EMPTY_CHAT_HINT } from 'src/shared/constants'
import {
  avatarPickerVisibleState,
  summaryInputVisibleState
} from 'src/stores/conversation'
import { configurationDrawerVisibleState, onlineState } from 'src/stores/global'
import { EmojiPickerProps } from 'src/types/global'
import Avatar from '../Avatar'
import EmojiPicker from '../EmojiPicker'

const ContactHeader: FC = () => {
  const { conversationId } = useParams()
  const currConversation = useLiveQuery(
    () => db.conversations.where({ conversationId }).first(),
    [conversationId]
  )
  const [summaryInputVisible, setSummaryInputVisible] = useRecoilState(
    summaryInputVisibleState
  )
  const [avatarPickerVisible, setAvatarPickerVisible] = useRecoilState(
    avatarPickerVisibleState
  )
  const isOnline = useRecoilValue(onlineState)
  const setConfigurationDrawerVisible = useSetRecoilState(
    configurationDrawerVisibleState
  )
  const [summaryValue, setSummaryValue] = useState(
    currConversation?.summary || ''
  )

  const summary =
    currConversation?.summary ||
    currConversation?.conversationId ||
    EMPTY_CHAT_HINT

  const openSummaryInput = () => {
    setSummaryValue(currConversation?.summary || '')
    setSummaryInputVisible(true)
  }

  const saveSummary = async () => {
    if (summaryValue.trim().length === 0) return
    if (!conversationId) return

    const changes = {
      summary: summaryValue,
      updatedAt: +new Date()
    }

    await db.conversations.update(conversationId, changes)
    setSummaryInputVisible(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveSummary()
    }
  }

  const saveAvatar = async (data: EmojiPickerProps) => {
    if (!conversationId) return

    const changes = {
      avatar: data.native,
      updatedAt: +new Date()
    }
    await db.conversations.update(conversationId, changes)
    setAvatarPickerVisible(false)
  }

  const deleteCurrConversation = async () => {
    if (!conversationId) return

    await db.conversations.delete(conversationId)
  }

  useEffect(() => {
    setSummaryInputVisible(false)
    setAvatarPickerVisible(false)
  }, [currConversation])

  return (
    <section className="relative flex items-start justify-between pb-5 pl-6 pr-6 pt-5">
      <section className="flex cursor-pointer items-center">
        {currConversation?.avatar ? (
          <div
            className="flex items-center justify-center text-5xl"
            onClick={() => setAvatarPickerVisible(true)}
          >
            {currConversation?.avatar}
          </div>
        ) : (
          <Avatar
            size="xs"
            src={ChatGPTLogoImg}
            onClick={() => setAvatarPickerVisible(true)}
          />
        )}

        {avatarPickerVisible && <EmojiPicker onEmojiSelect={saveAvatar} />}

        <section className="ml-4 flex flex-col">
          <div className="mb-1 flex items-center font-semibold text-black dark:text-dark-text">
            {summaryInputVisible ? (
              <>
                <Input
                  autoFocus
                  value={summaryValue}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setSummaryValue(e.target.value)}
                  className="w-80"
                  sx={{
                    '.MuiInput-input': {
                      padding: 0
                    }
                  }}
                />
                <CheckIcon className="h-4 w-4" onClick={saveSummary} />
              </>
            ) : (
              <div
                onClick={openSummaryInput}
                className="flex cursor-pointer items-center"
              >
                <p className="mr-4 text-base">{summary}</p>
                <PencilSquareIcon className="h-4 w-4" />
              </div>
            )}
          </div>

          <p className="flex items-center">
            <span
              className={classNames('mr-2 h-2.5 w-2.5 rounded-full ', {
                'bg-red-500': !isOnline,
                'bg-status-green': isOnline
              })}
            />
            <span className="text-xs font-semibold text-black text-opacity-60 dark:text-dark-text-sub">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </p>
        </section>
      </section>
      {currConversation && (
        <section className="flex flex-row gap-2">
          <section
            className="flex cursor-pointer rounded-lg bg-main-purple bg-opacity-10 pb-2.5 pl-4 pr-4 pt-2.5 text-main-purple"
            onClick={deleteCurrConversation}
          >
            <TrashIcon className="h-4 w-4" />
          </section>
          <section
            className="flex cursor-pointer rounded-lg bg-main-purple bg-opacity-10 pb-2.5 pl-4 pr-4 pt-2.5 text-main-purple"
            onClick={() => setConfigurationDrawerVisible(true)}
          >
            <AdjustmentsVerticalIcon className="h-4 w-4" />
          </section>
        </section>
      )}
    </section>
  )
}

export default ContactHeader
