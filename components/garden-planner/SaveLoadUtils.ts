import { ref } from 'vue'
import { LATEST_VERSION } from '~/assets/scripts/garden-planner/types/version'

export interface SavedGardenCode {
  title: string
  code: string
  dateCreated: string
  version: number
}

export const savedGardenCodes = ref<SavedGardenCode[]>([])

export function loadSavedGardenCodes() {
  const savedCodes = localStorage.getItem('savedGardenCodes')
  if (savedCodes)
    savedGardenCodes.value = (JSON.parse(savedCodes) as SavedGardenCode[]).sort((codeA, codeB) => ((new Date(codeA.dateCreated).getTime() - new Date(codeB.dateCreated).getTime()) * -1))
}

export function saveGardenCode(title: string, code: string, version: number) {
  const newCode: SavedGardenCode = {
    title,
    code,
    dateCreated: new Date().toISOString(),
    version,
  }
  savedGardenCodes.value.push(newCode)
  localStorage.setItem('savedGardenCodes', JSON.stringify(savedGardenCodes.value))
}

export function updateGardenCodeTitle(index: number, newTitle: string) {
  if (index >= 0 && index < savedGardenCodes.value.length) {
    savedGardenCodes.value[index].title = newTitle
    localStorage.setItem('savedGardenCodes', JSON.stringify(savedGardenCodes.value))
  }
}

export function deleteGardenCode(index: number) {
  if (index >= 0 && index < savedGardenCodes.value.length) {
    savedGardenCodes.value.splice(index, 1)
    localStorage.setItem('savedGardenCodes', JSON.stringify(savedGardenCodes.value))
  }
}

export interface SavedSettingsCode {
  title: string
  code: string
  dateCreated: string
  version: string
}

export const savedSettingsCodes = ref<SavedSettingsCode[]>([])

export function loadSavedSettingsCodes() {
  const savedCodes = localStorage.getItem('savedSettingsCodes')
  if (savedCodes)
    savedSettingsCodes.value = (JSON.parse(savedCodes) as SavedSettingsCode[]).sort((codeA, codeB) => ((new Date(codeA.dateCreated).getTime() - new Date(codeB.dateCreated).getTime()) * -1))
}

export function saveSettingsCode(title: string, code: string, version: string) {
  const newCode: SavedSettingsCode = {
    title,
    code,
    dateCreated: new Date().toISOString(),
    version,
  }
  savedSettingsCodes.value.push(newCode)
  localStorage.setItem('savedSettingsCodes', JSON.stringify(savedSettingsCodes.value))
}

export function updateSettingsCodeTitle(index: number, newTitle: string) {
  if (index >= 0 && index < savedSettingsCodes.value.length) {
    savedSettingsCodes.value[index].title = newTitle
    localStorage.setItem('savedSettingsCodes', JSON.stringify(savedSettingsCodes.value))
  }
}

export function deleteSettingsCode(index: number) {
  if (index >= 0 && index < savedSettingsCodes.value.length) {
    savedSettingsCodes.value.splice(index, 1)
    localStorage.setItem('savedSettingsCodes', JSON.stringify(savedSettingsCodes.value))
  }
}


export function saveDefaultSettingsCode(settingsCode: string) {
  const savedCode = `${LATEST_VERSION}_${settingsCode}`;
  localStorage.setItem('defaultSettings', savedCode)
}

export function loadDefaultSettingsCode(): { version: string; code: string } | null {
  const savedCode = localStorage.getItem('defaultSettings');
  if (!savedCode) return null;

  const firstUnderscoreIndex = savedCode.indexOf('_');
  
  if (firstUnderscoreIndex === -1) {
    console.error('No version code found')
    return { version: '', code: savedCode };
  }

  const version = savedCode.substring(0, firstUnderscoreIndex);
  const code = savedCode.substring(firstUnderscoreIndex + 1);
  
  return { version, code };
}
