<script setup lang="ts">
import PGPModal from '@/components/PGPModal.vue'
import { useSaveCode } from '~/stores/useSaveCode'

const saveCode = useSaveCode()

const modal = ref<InstanceType<typeof PGPModal> | null>(null)
function openModal() {
  modal.value?.showModal()
}
defineExpose({
  openModal,
})

const { text, copy } = useClipboard()

const useMarkdown = ref(false)
</script>

<template>
  <PGPModal ref="modal">
    <template #header>
      Save Layout
    </template>
    <template #body>
      <div class="card card-compact">
        <div class="card-body bg-palia-dark-blue p-4 px-3 rounded-md flex flex-col relative">
          <p class="card-title">
            Code
          </p>
          <p
            class="font-mono select-text font-thin cursor-pointer text-secondary p-2 hover:text-white hover:bg-misc-secondary w-full rounded-md"
            @click="copy(saveCode.code)"
          >
            {{ saveCode.code }}
          </p>
          <div class="card-actions ">
            <button
              class="btn btn-sm normal-case btn-ghost"
              :class="(text === saveCode.code) ? 'btn-disabled font-lights' : ''"
              @click="copy(saveCode.code)"
            >
              <font-awesome-icon :icon="['fas', 'copy']" />
              {{ (text === saveCode.code) ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>
      </div>
      <div class="card card-compact">
        <div class="card-body bg-palia-dark-blue p-4 px-3 rounded-md flex flex-col relative">
          <p class="card-title">
            Link
          </p>
          <p class="font-mono select-text font-thin cursor-pointer p-2 text-secondary hover:text-white hover:bg-misc-secondary w-full rounded-md" @click="copy((useMarkdown) ? saveCode.linkMarkdown : saveCode.link)">
            {{ (useMarkdown) ? saveCode.linkMarkdown : saveCode.link }}
          </p>
          <div class="card-actions flex-col">
            <button
              class="btn btn-sm normal-case btn-ghost"
              :class="(text === ((useMarkdown) ? saveCode.linkMarkdown : saveCode.link)) ? 'btn-disabled font-lights' : ''"
              @click="copy((useMarkdown) ? saveCode.linkMarkdown : saveCode.link)"
            >
              {{ (text === ((useMarkdown) ? saveCode.linkMarkdown : saveCode.link)) ? 'Copied!' : 'Copy' }}
              <font-awesome-icon :icon="['fas', 'copy']" />
            </button>
            <label class="grid gap-2 py-2 text-xs items-center font-semibold">
              <input v-model="useMarkdown" type="checkbox" class="toggle toggle-sm rounded-sm">
              <div class="font-normal">Markdown Syntax</div>
            </label>
            <p class="text-warning text-xs">
              <font-awesome-icon icon="exclamation-triangle" class="mr-1" />
              Planner links may get filtered by Reddit's site-wide filters, I'm working on resolving this.
            </p>
          </div>
        </div>
      </div>
    </template>
  </PGPModal>
</template>
