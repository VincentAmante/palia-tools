<script setup lang="ts">
import PGPModal from '@/components/PGPModal.vue'

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

function downloadImage() {
  emit('downloadImage')
  modal.value?.hideModal()
}
</script>

<template>
  <PGPModal ref="modal">
    <template #header>
      Export
    </template>
    <template #body>
      <div class="card card-compact">
        <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-dark-blue">
          <p class="card-title">
            As Image
          </p>

          <div class="card-actions">
            <button
              class="normal-case btn btn-outline"
              @click="downloadImage()"
            >
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
