<script setup lang="ts">
import PGPModal from '@/components/PGPModal.vue'

const emit = defineEmits<{
  (e: 'load', code: string): void
}>()
const modal = ref<InstanceType<typeof PGPModal> | null>(null)
function openModal() {
  modal.value?.showModal()
}
defineExpose({
  openModal,
})

const { text } = useClipboard()

function load(code: string) {
  emit('load', code)
  modal.value?.hideModal()
}

const loadCode = ref(text.value)
async function paste() {
  loadCode.value = await navigator.clipboard.readText()
}
</script>

<template>
  <PGPModal ref="modal">
    <template #header>
      Load Layout
    </template>
    <template #body>
      <div class="card card-compact">
        <div class="relative flex flex-col p-4 px-3 rounded-md card-body bg-palia-dark-blue">
          <p class="card-title">
            Clipboard
          </p>
          <textarea
            v-model="loadCode"
            class="textarea h-fit font-mono min-h-[8rem]"
          />
          <div class="card-actions">
            <button
              class="normal-case btn btn-sm btn-ghost"
              @click="paste()"
            >
              Paste Code
            </button>
          </div>
        </div>
      </div>

      <button class="normal-case btn w-fit" @click="() => load(loadCode)">
        Load
      </button>
    </template>
  </PGPModal>
</template>
