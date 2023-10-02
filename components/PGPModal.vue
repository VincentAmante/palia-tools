<script setup lang="ts">
const modal = ref<HTMLDialogElement | null>(null)
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
  <dialog ref="modal" class="modal">
    <div class="modal-box flex flex-col gap-2 px-3 py-6">
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
      <div class="divider my-0" />
      <div class="modal-body flex flex-col gap-2">
        <slot name="body" />
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
