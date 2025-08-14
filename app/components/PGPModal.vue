<script setup lang="ts">
const modal = ref<HTMLDialogElement | null>(null)

defineProps({
  useFullHeight: {
    type: Boolean,
    required: false,
    default: false,
  }
})

function showModal() {
  modal.value?.showModal()
}
function hideModal() {
  modal.value?.close()
}
defineExpose({
  showModal,
  hideModal,
})
</script>

<template>
  <dialog ref="modal" class="modal py-2">
    <div class="flex flex-col gap-2 px-3 py-6 modal-box" :class="{ 'h-full': useFullHeight }">
      <div>
        <div class="flex justify-between">
          <h2 class="text-xl ">
            <slot name="header" />
          </h2>
          <form method="dialog" class="">
            <button aria-label="close modal" class="btn btn-square btn-ghost btn-sm">
              <font-awesome-icon :icon="['fas', 'x']" class="text-xl" />
            </button>
          </form>
        </div>
        <div class="my-0 divider" />
      </div>
      <div class="flex flex-col gap-2 modal-body">
        <slot name="body" />
      </div>
    </div>
    <form method="dialog" class="modal-backdrop opacity-20">
      <button>close</button>
    </form>
  </dialog>
</template>
