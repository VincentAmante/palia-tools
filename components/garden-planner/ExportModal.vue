<script setup lang="ts">
import PGPModal from '@/components/PGPModal.vue'
import domtoimage from 'dom-to-image-more'
import download from 'downloadjs'
import uniqid from 'uniqid'



const isTakingScreenshot = useTakingScreenshot()

const emit = defineEmits<{
  (e: 'downloadImage'): void
}>()

const modal = ref<InstanceType<typeof PGPModal> | null>(null)
function openModal() {
  modal.value?.showModal()
}
defineExpose({
  openModal,
})


function filter(node: Node) {
  return node.nodeName !== '#comment'
}

async function saveToImage() {
  const node = document.getElementById('garden-planner') as HTMLElement

  if (!node) {
    console.error('No node found')
    return
  }

  isTakingScreenshot.set(true)
  const id = `PaliaGardenPlanner-${uniqid()}`

  await nextTick();


  domtoimage.toPng(
    node, {
    copyDefaultStyles: false,
    filter: filter,
    width: node.clientWidth,
    height: node.clientHeight
  },
  ).then(
    (dataUrl: string) => {
      if (download(dataUrl, id)) {
        useTakingScreenshot().set(false)
      }
    },
  ).finally((err: unknown) => {
    isTakingScreenshot.set(false)
  })

}

const downloadedImgSrc = ref('')

const displayWidth = ref(0)

function setScreenshotLayout() {
  const gardenDisplay = document.getElementById('garden-display')
  const display = document.getElementById('garden-planner')

  if (!gardenDisplay || !display) {
    return
  }

  displayWidth.value = (gardenDisplay.clientWidth)
  if (useGarden().isGardenWide)
    displayWidth.value += gardenDisplay.clientWidth || 0

  displayWidth.value = Math.max(displayWidth.value, 1368)
  display.style.width = `${displayWidth.value}px`
}

function resetScreenshotLayout() {

  const gardenDisplay = document.getElementById('garden-display')
  const display = document.getElementById('garden-planner')

  if (!gardenDisplay || !display) return

  display.style.width = ''
}

watch(useTakingScreenshot(), () => {
  if (useTakingScreenshot().get)
    setScreenshotLayout()
  else if (useTakingScreenshot().get === false && displayWidth.value > 0) {
    resetScreenshotLayout()
    modal.value?.hideModal()
  }
})


</script>

<template>
  <PGPModal ref="modal">
    <template #header>
      Export
    </template>
    <template #body>
      <div class="card card-compact">
        <div class="card-body bg-palia-blue-dark p-4 px-3 rounded-md flex flex-col relative">
          <p class="card-title">
            As Image
          </p>
          <div class="card-actions">
            <button class="btn normal-case btn-outline" @click="async () => await saveToImage()">
              <span v-if="isTakingScreenshot.get" class="loading loading-spinner loading-sm" />
              Export as Image
            </button>
          </div>

          <p>
            Export your garden as a landscape PNG image.
          </p>
          <p class="text-warning">
            <font-awesome-icon icon="exclamation-triangle" class="mr-1" />
            App may freeze for a few seconds while it generates the image.
          </p>
          <p class="text-warning">
            Known to break on some platforms
          </p>
        </div>
      </div>
    </template>
  </PGPModal>
</template>
