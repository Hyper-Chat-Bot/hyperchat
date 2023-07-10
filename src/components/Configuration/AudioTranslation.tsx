import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useLiveQuery } from 'dexie-react-hooks'
import { Formik, useFormikContext } from 'formik'
import { FC, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { models, responseFormats } from 'src/configurations/audioTranscription'
import { AudioTranslationConfiguration } from 'src/configurations/audioTranslation'
import { db } from 'src/db'
import { configurationDrawerVisibleState } from 'src/stores/global'
import Divider from '../Divider'
import InputSlider from '../InputSlider'

const Configuration: FC = () => {
  const { conversationId } = useParams()
  const [visible, setVisible] = useRecoilState(configurationDrawerVisibleState)
  const currConversation = useLiveQuery(() => {
    return db.conversations.where({ conversationId }).first()
  }, [conversationId])

  const updateConfiguration = async (values: AudioTranslationConfiguration) => {
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

        <Formik<AudioTranslationConfiguration>
          initialValues={
            currConversation.configuration as AudioTranslationConfiguration
          }
          onSubmit={updateConfiguration}
        >
          {(formik) => (
            <section className="no-scrollbar h-[calc(100vh_-_7.5625rem)] overflow-y-scroll p-6">
              <FormControl size="small" sx={{ marginBottom: 4 }} fullWidth>
                <InputLabel id="audio-transcription-model-select-label">
                  Model
                </InputLabel>
                <Select
                  fullWidth
                  labelId="audio-transcription-model-select-label"
                  id="audio-transcription-model-select"
                  label="Model"
                  {...formik.getFieldProps('model')}
                >
                  {models.map((model) => (
                    <MenuItem key={model} value={model}>
                      {model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel id="audio-transcription-response-format-select-label">
                  Response Format
                </InputLabel>
                <Select
                  fullWidth
                  labelId="audio-transcription-response-format-select-label"
                  id="audio-transcription-response-format-select"
                  label="Response Format"
                  {...formik.getFieldProps('response_format')}
                >
                  {responseFormats.map((responseFormat) => (
                    <MenuItem key={responseFormat} value={responseFormat}>
                      {responseFormat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <InputSlider
                title="Temperature"
                tooltipTitle="Controls randomness. Lowering the temperature means that the model will produce more repetitive and deterministic responses. Increasing the temperature will result in more unexpected or creative responses. Try adjusting temperature or Top P but not both."
                min={0}
                max={1}
                step={0.01}
                defaultValue={
                  (
                    currConversation.configuration as AudioTranslationConfiguration
                  ).temperature
                }
                setFieldValue={(value: number) =>
                  formik.setFieldValue('temperature', value)
                }
              />
              <AutoSubmitToken />
            </section>
          )}
        </Formik>
      </section>
    </Drawer>
  )
}

export default Configuration
