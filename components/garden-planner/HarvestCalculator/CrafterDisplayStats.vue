<script setup lang="ts">
import CropDisplay from './CropDisplay.vue'
import type { ICrafterData } from '~/assets/scripts/garden-planner/classes/Crafters/ProduceManager'
import type { LoggableItem } from '~/assets/scripts/garden-planner/classes/Crafters/ICrafter'

const props = defineProps<{
  crafter: ICrafterData
}>()

function getId(item: LoggableItem) {
  return `${item.name}-${item.type}-${item.isStar}`
}

const summary = computed(() => {
  const insertions: Record<string, LoggableItem> = {}
  const collections: Record<string, LoggableItem> = {}

  for (const log of Object.values(props.crafter.logs)) {
    if (log.insertions && log.insertions.length > 0) {
      for (const insertion of log.insertions) {
        const id = getId(insertion)

        if (insertions[id] === undefined) {
          insertions[id] = {
            ...insertion,
          }
        }
        else {
          insertions[id] = {
            ...insertions[id],
            count: insertions[id].count + insertion.count,
          }
        }
      }
    }

    if (log.collections && log.collections.length > 0) {
      for (const collection of log.collections) {
        const id = getId(collection)

        if (collections[id] === undefined) {
          collections[id] = {
            ...collection,
          }
        }
        else {
          collections[id] = {
            ...collections[id],
            count: collections[id].count + collection.count,
          }
        }
      }
    }
  }

  return {
    insertions,
    collections,
  }
})

function minutesToHours(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  const hoursString = hours > 1 ? `${hours}Hrs ` : hours === 1 ? `${hours}Hr ` : ''
  const minutesString = remainingMinutes > 1 ? `${remainingMinutes}mins` : remainingMinutes === 1 ? `${remainingMinutes}min` : '0 min'

  return `${hoursString}${minutesString}`
}
</script>

<template>
  <div class="flex flex-col w-full p-2 gap-y-2 text-sm">
    <div class="w-fit">
      <div class="tooltip" data-tip="Total time includes the wait for harvests & idle time">
        <p class="w-full">
          <span class="font-bold">
            Total Time -
          </span>
          {{ minutesToHours(crafter.lifetimeMinutes) }}
        </p>
      </div>
      <p>
        <span class="font-bold">
          Processing Time -
        </span>
        {{ minutesToHours(crafter.elapsedTimeMinutes) }}
        <!-- <span
          v-if="crafter.elapsedTimeMinutes > 0 && crafter.lifetimeMinutes > 0"
          class="font-bold"
        >
          ({{ (crafter.elapsedTimeMinutes / crafter.lifetimeMinutes * 100).toPrecision(2) }}%)
        </span> -->
      </p>
    </div>
    <section class="h-full">
      <p class="text-sm">
        Input
      </p>
      <ul class="flex flex-wrap bg-primary p-1 rounded-md h-full">
        <li
          v-for="(insertion, index) in summary.insertions"
          :key="index"
          class=""
        >
          <CropDisplay
            :img-src="insertion.image"
            :amount="insertion.count"
            :star="insertion.isStar"
            :tooltip="`${(insertion.count * insertion.price).toLocaleString()} Gold`"
          />
        </li>
      </ul>
    </section>
    <section class="">
      <p class="text-sm">
        Output
      </p>
      <ul class="flex flex-wrap bg-primary p-1 rounded-md h-fit">
        <li
          v-for="(insertion, index) in summary.collections"
          :key="index"
        >
          <CropDisplay
            :img-src="insertion.image"
            :amount="insertion.count"
            :star="insertion.isStar"
            :tooltip="`${(insertion.count * insertion.price).toLocaleString()} Gold`"
          />
        </li>
      </ul>
    </section>
  </div>
</template>
