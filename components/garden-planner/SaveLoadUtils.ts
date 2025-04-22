import { ref } from 'vue'

interface SavedGardenCode {
  title: string
  code: string
  dateCreated: string
  version: number
}

const savedGardenCodes = ref<SavedGardenCode[]>([])

function loadSavedGardenCodes() {
  const savedCodes = localStorage.getItem('savedGardenCodes')
  if (savedCodes)
    savedGardenCodes.value = JSON.parse(savedCodes)
}

function saveGardenCode(title: string, code: string, version: number) {
  const newCode: SavedGardenCode = {
    title,
    code,
    dateCreated: new Date().toISOString(),
    version,
  }
  savedGardenCodes.value.push(newCode)
  localStorage.setItem('savedGardenCodes', JSON.stringify(savedGardenCodes.value))
}

function updateGardenCodeTitle(index: number, newTitle: string) {
  if (index >= 0 && index < savedGardenCodes.value.length) {
    savedGardenCodes.value[index].title = newTitle
    localStorage.setItem('savedGardenCodes', JSON.stringify(savedGardenCodes.value))
  }
}

function deleteGardenCode(index: number) {
  if (index >= 0 && index < savedGardenCodes.value.length) {
    savedGardenCodes.value.splice(index, 1)
    localStorage.setItem('savedGardenCodes', JSON.stringify(savedGardenCodes.value))
  }
}

export { savedGardenCodes, loadSavedGardenCodes, saveGardenCode, updateGardenCodeTitle, deleteGardenCode }
