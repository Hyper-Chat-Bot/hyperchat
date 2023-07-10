import { atom } from 'recoil'

export const summaryInputVisibleState = atom({
  key: 'summaryInputVisibleState',
  default: false
})

export const avatarPickerVisibleState = atom({
  key: 'avatarPickerVisibleState',
  default: false
})

export const currPlayingAudioIdState = atom<string | null>({
  key: 'currPlayingAudioIdState',
  default: null
})

export const streamDataState = atom({
  key: 'streamDataState',
  default: ''
})
