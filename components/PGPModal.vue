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
    <div class="modal-box flex flex-col gap-2">
      <h3 class="text-lg">
        <slot name="header" />
      </h3>
      <div class="modal-body">
        <slot name="body" />
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
