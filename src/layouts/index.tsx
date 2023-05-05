import { createTheme, ThemeProvider } from '@mui/material/styles'
import { SnackbarProvider } from 'notistack'
import { FC, Suspense, useMemo } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Loading from 'src/components/Loading'
import Sidebar from 'src/components/Sidebar'
import { SnackbarUtilsConfig } from 'src/components/Snackbar'
import { useOnline, useSettings, useTheme } from 'src/hooks'
import { routers } from 'src/routers'
import {
  SNACKBAR_ANCHOR_ORIGIN,
  SNACKBAR_AUTO_HIDE_DURATION,
  SNACKBAR_MAX_NUM
} from 'src/shared/constants'

const Layouts: FC = () => {
  const { theme } = useTheme()
  const { settings } = useSettings()
  useOnline()

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          primary: {
            main: '#615ef0'
          }
        },
        typography: {
          button: {
            textTransform: 'none'
          }
        },
        shape: {
          borderRadius: 8
        }
      }),
    [theme]
  )

  if (!settings) return <Loading />

  return (
    <Suspense fallback={<Loading />}>
      <ThemeProvider theme={muiTheme}>
        <SnackbarProvider
          maxSnack={SNACKBAR_MAX_NUM}
          anchorOrigin={SNACKBAR_ANCHOR_ORIGIN}
          autoHideDuration={SNACKBAR_AUTO_HIDE_DURATION}
          preventDuplicate
        >
          <SnackbarUtilsConfig />
          <section className="container flex w-screen flex-row overflow-x-hidden dark:bg-gray-800">
            <BrowserRouter>
              <Sidebar />
              <Routes>
                {routers.map((router) => (
                  <Route
                    key={router.path}
                    path={router.path}
                    element={<router.element />}
                  />
                ))}
              </Routes>
            </BrowserRouter>
          </section>
        </SnackbarProvider>
      </ThemeProvider>
    </Suspense>
  )
}

export default Layouts
