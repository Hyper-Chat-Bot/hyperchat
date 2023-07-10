import { atom } from 'recoil'
import { themeModeToTheme } from 'src/shared/utils'
import { LoadingType, ThemeMode } from 'src/types/global'

export const onlineState = atom({
  key: 'onlineState',
  default: window.navigator.onLine
})

export const themeState = atom<ThemeMode.dark | ThemeMode.light>({
  key: 'themeState',
  default: themeModeToTheme()
})

export const configurationDrawerVisibleState = atom({
  key: 'configurationDrawerVisibleState',
  default: false
})

export const loadingState = atom({
  key: 'loadingState',
  default: LoadingType.NoLoading
})
