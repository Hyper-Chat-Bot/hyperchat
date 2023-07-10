import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { useLiveQuery } from 'dexie-react-hooks'
import { Formik, useFormikContext } from 'formik'
import { FC, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import {
  AudioTranscriptionConfiguration,
  models,
  responseFormats
} from 'src/configurations/audioTranscription'
import { db } from 'src/db'
import { countries } from 'src/shared/countries'
import { configurationDrawerVisibleState } from 'src/stores/global'
import Divider from '../Divider'
import InputSlider from '../InputSlider'

const Configuration: FC = () => {
  const { conversationId } = useParams()
  const [visible, setVisible] = useRecoilState(configurationDrawerVisibleState)
  const currConversation = useLiveQuery(() => {
    return db.conversations.where({ conversationId }).first()
  }, [conversationId])

  const updateConfiguration = async (
    values: AudioTranscriptionConfiguration
  ) => {
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

        <Formik<AudioTranscriptionConfiguration>
          initialValues={
            currConversation.configuration as AudioTranscriptionConfiguration
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
                    currConversation.configuration as AudioTranscriptionConfiguration
                  ).temperature
                }
                setFieldValue={(value: number) =>
                  formik.setFieldValue('temperature', value)
                }
              />
              <FormControl size="small" fullWidth>
                <Autocomplete
                  id="audio-transcription-language-select"
                  size="small"
                  options={countries}
                  autoHighlight
                  getOptionLabel={(option) => option.label}
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                      {...props}
                    >
                      <img
                        loading="lazy"
                        width="20"
                        src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                        alt={option.code}
                      />
                      {option.label} ({option.code})
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Language"
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password' // disable autocomplete and autofill
                      }}
                      helperText="The language of the input audio. Supplying the input language
                      in ISO-639-1 format will improve accuracy and latency."
                    />
                  )}
                  value={countries.find(
                    (country) => country.code === formik.values.language
                  )}
                  onChange={(_, value) =>
                    formik.setFieldValue('language', value?.code)
                  }
                />
              </FormControl>
              <AutoSubmitToken />
            </section>
          )}
        </Formik>
      </section>
    </Drawer>
  )
}

export default Configuration
