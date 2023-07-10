import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useLiveQuery } from 'dexie-react-hooks'
import { Formik, useFormikContext } from 'formik'
import { FC, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import {
  ImageGenerationConfiguration,
  responseFormats,
  sizes
} from 'src/configurations/imageGeneration'
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

  const updateConfiguration = async (values: ImageGenerationConfiguration) => {
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

        <Formik<ImageGenerationConfiguration>
          initialValues={
            currConversation.configuration as ImageGenerationConfiguration
          }
          onSubmit={updateConfiguration}
        >
          {(formik) => (
            <section className="no-scrollbar h-[calc(100vh_-_7.5625rem)] overflow-y-scroll p-6">
              <InputSlider
                title="N"
                tooltipTitle="The number of images to generate."
                min={1}
                max={10}
                step={1}
                defaultValue={
                  (
                    currConversation.configuration as ImageGenerationConfiguration
                  ).n
                }
                setFieldValue={(value: number) =>
                  formik.setFieldValue('n', value)
                }
              />

              <FormControl
                size="small"
                fullWidth
                sx={{
                  marginBottom: 4
                }}
              >
                <InputLabel id="iamge-generation-size-select-label">
                  Size
                </InputLabel>
                <Select
                  labelId="iamge-generation-size-select-label"
                  id="iamge-generation-size-select"
                  label="Size"
                  {...formik.getFieldProps('size')}
                >
                  {sizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  The size of the generated images.
                </FormHelperText>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel id="iamge-generation-response-format-select-label">
                  Response Format
                </InputLabel>
                <Select
                  labelId="iamge-generation-response-format-select-label"
                  id="iamge-generation-response-format-select"
                  label="Response Format"
                  {...formik.getFieldProps('response_format')}
                >
                  {responseFormats.map((responseFormat) => (
                    <MenuItem key={responseFormat} value={responseFormat}>
                      {responseFormat}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  The format in which the generated images are returned.
                </FormHelperText>
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
