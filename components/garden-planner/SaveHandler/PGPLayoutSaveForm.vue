<script setup lang="ts">
import uniqid from 'uniqid'

const props = defineProps({
  saveCode: {
    type: String,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'saveLayout', value: SaveLayout): void
}>()

const saveName = ref('')

interface SaveLayout {
  saveName: string
  saveCode: string
  uniqueId: string
}

function saveLayout() {
  emit('saveLayout', {
    saveName: saveName.value,
    saveCode: props.saveCode,
    uniqueId: uniqid(),
  })
}
</script>

<template>
  <form
    class="card card-compact"
    @submit.prevent="saveLayout"
  >
    <div class="card-body bg-palia-dark-blue rounded-md">
      <div class="card-title text-base">
        New Layout
      </div>
      <div class="form-control">
        <div class="flex items-center gap-2">
          <input
            id="save-name"
            v-model="saveName"
            type="text"
            class="input input-bordered grow"
          >
        </div>
        <div class="label">
          <label for="save-name" class="label-text-alt">Layout Name</label>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-sm btn-ghost">
          <font-awesome-icon :icon="['fas', 'floppy-disk']" />
          Save
        </button>
      </div>
    </div>
  </form>
</template>
