import Drawer from '@mui/material/Drawer'
import { useLiveQuery } from 'dexie-react-hooks'
import { Formik, useFormikContext } from 'formik'
import { FC, ReactElement, cloneElement, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import Divider from 'src/components/Divider'
import { ChatConfiguration } from 'src/configurations/chat'
import { db } from 'src/db'
import { configurationDrawerVisibleState } from 'src/stores/global'

interface Props {
  children: ReactElement
}

const ConfigurationWrapper: FC<Props> = ({ children }) => {
  const { conversationId } = useParams()
  const [visible, setVisible] = useRecoilState(configurationDrawerVisibleState)
  const currConversation = useLiveQuery(() => {
    return db.conversations.where({ conversationId }).first()
  }, [conversationId])

  const updateConfiguration = async (values: ChatConfiguration) => {
    if (!currConversation) {
      return
    }

    await db.conversations.update(currConversation.conversationId, {
      configuration: values
    })
  }

  const AutoSubmitToken = () => {
    const { submitForm } = useFormikContext()
    useEffect(() => {
      if (!visible) {
        submitForm()
      }
    }, [visible])

    return null
  }

  if (!currConversation) {
    return null
  }

  return (
    <Drawer anchor="right" open={visible} onClose={() => setVisible(false)}>
      <section className="w-87.75">
        <section className="flex h-22 items-center justify-between pl-6">
          <span className="text-xl font-semibold dark:text-dark-text">
            Configuration
          </span>
        </section>

        <Divider />

        <Formik<ChatConfiguration>
          initialValues={currConversation.configuration as ChatConfiguration}
          onSubmit={updateConfiguration}
        >
          {(formik) => (
            <section className="no-scrollbar h-[calc(100vh_-_7.5625rem)] overflow-y-scroll p-6">
              {cloneElement(children, { formik })}
              <AutoSubmitToken />
            </section>
          )}
        </Formik>
      </section>
    </Drawer>
  )
}

export default ConfigurationWrapper
