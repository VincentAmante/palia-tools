<script setup lang="ts">
import OptionCard from './OptionCard.vue'
import { DistributionMethod } from '~/assets/scripts/garden-planner/imports'
import type { ICrafterCounts, ICrafterSettings, IManagerSettings } from '~/assets/scripts/garden-planner/imports'

const props = defineProps<{
  managerSettings: IManagerSettings
  crafterSettings: ICrafterSettings
  crafterCounts: ICrafterCounts
  distributionMethod: DistributionMethod
}>()

const emit = defineEmits<{
  (e: 'updateDistributionMethod', value: DistributionMethod): void
}>()

const clientManagerSettings = ref(props.managerSettings)
const clientCrafterSettings = ref(props.crafterSettings)
const clientCrafterCounts = ref(props.crafterCounts)
const clientDistributionMethod = ref<DistributionMethod>(props.distributionMethod)

function onUpdateDistributionMethod() {
  emit('updateDistributionMethod', clientDistributionMethod.value)
}

function isDedicated() {
  return clientDistributionMethod.value === DistributionMethod.Dedicated
}

const methodText = computed(() => {
  switch (clientDistributionMethod.value) {
    case DistributionMethod.Dedicated:
      return 'Each crop gets its dedicated crafters, and will only be placed in those crafters.'
    case DistributionMethod.Vip:
      return 'First crop in priority gets as much of its crops placed in any available crafter before moving on.'
  }
})
</script>

<template>
  <section>
    <section>
      <div>
        <p class="text-misc py-1 font-bold">
          Crafters
        </p>
        <p class="text-misc text-sm">
          Manually sets crafters, is only used outside of Dedicated Distribution.
        </p>
      </div>
      <div class="grid gap-2 pr-2 pb-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <label
          for="seedCollectors"
          class="rounded-md p-2 px-3 bg-accent text-misc flex flex-col justify-start"
          :class="(isDedicated()) ? 'opacity-50' : ''"
        >
          <div class="flex flex-col items-center text-center gap-1">
            <p class="py-1 font-bold">
              Seed Collectors
            </p>
            <div class="flex gap-2 items-center">
              <input
                v-model="clientCrafterCounts.seeders"
                type="number" class="input"
                min="0" max="999"
                :disabled="isDedicated()"
              >
            </div>
          </div>
        </label>
        <label
          for="preserveJars"
          class="rounded-md p-2 px-3 bg-accent text-misc flex flex-col justify-start"
          :class="(isDedicated()) ? 'opacity-50' : ''"
        >
          <div class="flex flex-col items-center text-center gap-1">
            <p class="py-1 font-bold">
              Preserve Jars
            </p>
            <div class="flex gap-2 items-center">
              <input
                v-model="clientCrafterCounts.jars"
                type="number" class="input"
                min="0" max="999"
                :disabled="isDedicated()"
              >
            </div>
          </div>
        </label>
      </div>
    </section>
    <section>
      <p class="text-misc py-1 font-bold">
        Manager Settings
      </p>
      <div class="grid gap-2 pr-2 pb-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <OptionCard label="distributionMethod" name="Distribution Method">
          <template #input>
            <select
              v-model="clientDistributionMethod" class="input text-accent"
              @change="onUpdateDistributionMethod()"
            >
              <template v-for="method in Object.values(DistributionMethod)" :key="method">
                <option :value="method">
                  {{ method }}
                </option>
              </template>
            </select>
          </template>
          <template #labels>
            <p>
              <span class="font-bold">
                {{ clientDistributionMethod }}:
              </span>
              {{ methodText }}
            </p>
          </template>
        </OptionCard>
        <OptionCard label="spreadCrops" name="Spread Crops">
          <template #input>
            <input
              v-model="clientManagerSettings.spreadCrops"
              type="checkbox" class="toggle rounded-md"
            >
          </template>
          <template #labels>
            <p>
              <span class="">
                {{ clientManagerSettings.spreadCrops
                  ? 'Attempts to spread crops evenly across all crafters'
                  : 'Fills crafters one stack at a time'
                }}
              </span>
            </p>
          </template>
        </OptionCard>
      </div>
    </section>
  </section>
</template>
