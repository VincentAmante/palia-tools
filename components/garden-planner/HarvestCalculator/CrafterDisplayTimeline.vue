<script setup lang="ts">
import type { ICrafterData } from '~/assets/scripts/garden-planner/classes/Crafters/ProduceManager'

defineProps<{
  crafter: ICrafterData
}>()
</script>

<template>
  <ul class="timeline px-4 text-accent">
    <li>
      <div class="timeline-start timeline-box rounded-md bg-palia-blue border-palia-dark-blue text-accent">
        Insertion
      </div>
      <div class="timeline-middle font-black uppercase text-misc px-2 flex">
        Day
        <span
          class="px-[1px] ml-2 text-accent font-bold bg-misc rounded-full aspect-square w-6 text-center align-middle flex items-center justify-center"
        >0</span>
      </div>
      <div class="timeline-end timeline-box rounded-md bg-palia-blue border-palia-dark-blue text-accent">
        Collection
      </div>
      <hr>
    </li>

    <template v-for="(log, day) in crafter.logs" :key="day">
      <li>
        <hr>
        <div
          v-if="log.insertions && log.insertions.length > 0"
          class="timeline-start timeline-box rounded-md bg-primary"
        >
          <div
            v-for="(crop, insertionIndex) in log.insertions" :key="insertionIndex" class="relative w-10 h-10"
          >
            <nuxt-img :src="crop.image" :alt="crop.type" width="64" class="aspect-square object-contain" />
            <p v-if="crop.isStar" class="absolute left-0 bottom-0">
              <font-awesome-icon class="text-quality-increase text-sm" :icon="['fas', 'star']" />
            </p>
            <p class="absolute right-0 bottom-0 rounded-full text-center text-neutral bg-primary px-1 bg-opacity-80 font-bold text-sm">
              {{ crop.count }}
            </p>
          </div>
        </div>
        <div
          class="timeline-middle mx-1 px-[1px] text-accent font-bold bg-misc rounded-full aspect-square w-6 text-center align-middle flex items-center justify-center"
        >
          {{ day }}
        </div>
        <div
          v-if="log.collections && log.collections.length > 0"
          class="timeline-end timeline-box rounded-md bg-primary"
        >
          <div v-for="(crop, collectionIndex) in log.collections" :key="collectionIndex" class="relative w-10 h-10">
            <nuxt-img :src="crop.image" :alt="crop.type" width="64" class="aspect-square object-contain" />
            <p v-if="crop.isStar" class="absolute left-0 bottom-0">
              <font-awesome-icon class="text-quality-increase text-xs" :icon="['fas', 'star']" />
            </p>
            <p class="absolute right-0 bottom-0 rounded-full text-center text-neutral bg-primary px-1 bg-opacity-80 font-bold text-sm">
              {{ crop.count }}
            </p>
          </div>
        </div>
        <hr>
      </li>
    </template>
  </ul>
</template>
