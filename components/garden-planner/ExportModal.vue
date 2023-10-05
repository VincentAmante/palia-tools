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
        <div class="card-body bg-palia-dark-blue p-4 px-3 rounded-md flex flex-col relative">
          <p class="card-title">
            As Image
          </p>
          <div class="card-actions">
            <button
              class="btn btn-sm normal-case btn-ghost"
              @click="downloadImage()"
            >
              Export as Image
            </button>
          </div>
        </div>
      </div>
    </template>
  </PGPModal>
</template>
