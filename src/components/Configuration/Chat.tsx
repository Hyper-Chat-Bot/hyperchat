import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useLiveQuery } from 'dexie-react-hooks'
import { Formik, useFormikContext } from 'formik'
import { FC, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { ChatConfiguration, models } from 'src/configurations/chat'
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
              <FormControl size="small" sx={{ marginBottom: 4 }} fullWidth>
                <InputLabel id="model-select-label">Model</InputLabel>
                <Select
                  fullWidth
                  labelId="model-select-label"
                  id="model-select"
                  label="Model"
                  {...formik.getFieldProps('model')}
                >
                  {models.map((gpt) => (
                    <MenuItem key={gpt} value={gpt}>
                      {gpt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                id="system-message"
                label="System Message"
                multiline
                rows={5}
                placeholder="Eg: You are an AI assistant that helps people find information."
                {...formik.getFieldProps('system_message')}
              />

              <InputSlider
                title="Max response"
                tooltipTitle="Set a limit on the number of tokens per model response. The API supports a maximum of 4000 tokens shared between the prompt (including system message, examples, message history, and user query) and the model's response. One token is roughly 4 characters for typical English text."
                min={1}
                max={4000}
                step={1}
                defaultValue={
                  (currConversation.configuration as ChatConfiguration)
                    .max_tokens
                }
                setFieldValue={(value: number) =>
                  formik.setFieldValue('max_tokens', value)
                }
              />

              <InputSlider
                title="Temperature"
                tooltipTitle="Controls randomness. Lowering the temperature means that the model will produce more repetitive and deterministic responses. Increasing the temperature will result in more unexpected or creative responses. Try adjusting temperature or Top P but not both."
                min={0}
                max={1}
                step={0.01}
                defaultValue={
                  (currConversation.configuration as ChatConfiguration)
                    .temperature
                }
                setFieldValue={(value: number) =>
                  formik.setFieldValue('temperature', value)
                }
              />

              <Tooltip
                title="Make responses stop at a desired point, such as the end of a sentence or list. Specify up to four sequences where the model will stop generating further tokens in a response. The returned text will not contain the stop sequence."
                placement="top"
              >
                <FormControl size="small" fullWidth>
                  <Autocomplete
                    multiple
                    id="stop"
                    options={[]}
                    value={formik.values.stop}
                    freeSolo
                    renderTags={(value: readonly string[], getTagProps) =>
                      value.map((option: string, index: number) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Stop sequences"
                        placeholder="Enter sequence and press Tab"
                      />
                    )}
                    onChange={(_, value) => formik.setFieldValue('stop', value)}
                  />
                </FormControl>
              </Tooltip>

              <InputSlider
                title="Top P"
                tooltipTitle="Similar to temperature, this controls randomness but uses a different method. Lowering Top P will narrow the model’s token selection to likelier tokens. Increasing Top P will let the model choose from tokens with both high and low likelihood. Try adjusting temperature or Top P but not both."
                min={0}
                max={1}
                step={0.01}
                defaultValue={
                  (currConversation.configuration as ChatConfiguration).top_p
                }
                setFieldValue={(value: number) =>
                  formik.setFieldValue('top_p', value)
                }
              />
              <InputSlider
                title="Frequency penalty"
                tooltipTitle="Reduce the chance of repeating a token proportionally based on how often it has appeared in the text so far. This decreases the likelihood of repeating the exact same text in a response."
                min={0}
                max={2}
                step={0.01}
                defaultValue={
                  (currConversation.configuration as ChatConfiguration)
                    .frequency_penalty
                }
                setFieldValue={(value: number) =>
                  formik.setFieldValue('frequency_penalty', value)
                }
              />
              <InputSlider
                title="Presence penalty"
                tooltipTitle="Reduce the chance of repeating any token that has appeared in the text at all so far. This increases the likelihood of introducing new topics in a response."
                min={0}
                max={2}
                step={0.01}
                defaultValue={
                  (currConversation.configuration as ChatConfiguration)
                    .presence_penalty
                }
                setFieldValue={(value: number) =>
                  formik.setFieldValue('frequency_penalty', value)
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
