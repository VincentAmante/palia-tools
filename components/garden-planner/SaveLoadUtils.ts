import { ref } from 'vue'
import { convertV_0_3SettingsToV_0_4Settings } from '~/assets/scripts/garden-planner/save-handler'
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
  version: number
}

const DEFAULT_SETTING_PRESETS = [
  {
    title: 'From Scratch (Lvl 0)',
    code: '0.4_D180Nss',
    dateCreated: '2025-07-06T16:33:14.336Z',
    version: 1
  },
  {
    title: 'Level Where all is starred (Lvl 25)',
    code: '0.4_L25D180',
    dateCreated: '2025-07-06T16:33:15.336Z',
    version: 1
  },
  {
    title: 'Can\'t get normals no more (Lvl 50)',
    code: '0.4_L50D180Nss',
    dateCreated: '2025-07-06T16:33:16.336Z',
    version: 1
  },
  {
    title: 'Diving Into Processing',
    code: '0.4_D180L25Cr0.T.P-TP-P.S-PS-Cb.P-CbP-R.S-RS-W.S-WS-B.P-BP-A.P-AP-Cr.P-CrP-Bt.S-BtS-C.P-CP-O.P-OP-Bk.S-BkS-Co.S-CoS-S.P-SP',
    dateCreated: '2025-07-06T16:55:45.708Z',
    version: 1
  }
] satisfies SavedSettingsCode[]

export const savedSettingsCodes = ref<SavedSettingsCode[]>([])

export function loadSavedSettingsCodes() {
  const savedCodes = localStorage.getItem('savedSettingsCodes')
  if (savedCodes)
    savedSettingsCodes.value = (JSON.parse(savedCodes) as SavedSettingsCode[]).sort((codeA, codeB) => ((new Date(codeA.dateCreated).getTime() - new Date(codeB.dateCreated).getTime()) * -1))
  else 
    savedSettingsCodes.value = DEFAULT_SETTING_PRESETS
}

export function saveSettingsCode(title: string, code: string, version: number) {
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

export function loadSavedSettingsCode(savedCode: string): { version: string; code: string } | null {
  const firstUnderscoreIndex = savedCode.indexOf('_');
  let attemptUpdate = false;

  if (firstUnderscoreIndex === -1) {
    console.error('No version code found')
    return { version: '', code: savedCode };
  }

  let version = savedCode.substring(0, firstUnderscoreIndex);

  if (version !== LATEST_VERSION) {
    attemptUpdate = true
  }

  let code = savedCode.substring(firstUnderscoreIndex + 1);
  if (attemptUpdate) {
    // TODO: Move this to save-handler file

    if (version === '0.3') {
      code = convertV_0_3SettingsToV_0_4Settings(code)
      version = '0.4'
    } else {
      console.error('Warning: Currently no save conversion is being applied to this outdated code', `version: ${version}, saveCode: ${code}`)
    }
  }


  return { version, code };
}
