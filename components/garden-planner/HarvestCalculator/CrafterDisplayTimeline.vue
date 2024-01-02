<script setup lang="ts">
import type { ICrafterData } from '~/assets/scripts/garden-planner/classes/Crafters/ProduceManager'

defineProps<{
  crafter: ICrafterData
}>()
</script>

<template>
  <ul class="px-4 timeline text-accent">
    <li>
      <div class="rounded-md timeline-start timeline-box bg-palia-blue border-palia-dark-blue text-accent">
        Insertion
      </div>
      <div class="flex px-2 font-black uppercase timeline-middle text-misc">
        Day
        <span
          class="px-[1px] ml-2 text-accent font-bold bg-misc rounded-full aspect-square w-6 text-center align-middle flex items-center justify-center"
        >0</span>
      </div>
      <div class="rounded-md timeline-end timeline-box bg-palia-blue border-palia-dark-blue text-accent">
        Collection
      </div>
      <hr>
    </li>

    <template v-for="(log, day) in crafter.logs" :key="day">
      <li>
        <hr>
        <div
          v-if="log.insertions && log.insertions.length > 0"
          class="rounded-md timeline-start timeline-box bg-primary"
        >
          <div
            v-for="(crop, insertionIndex) in log.insertions" :key="insertionIndex" class="relative w-10 h-10"
          >
            <nuxt-img :src="crop.image" :alt="crop.type" width="64" class="object-contain aspect-square" />
            <p v-if="crop.isStar" class="absolute bottom-0 left-0">
              <font-awesome-icon class="text-sm text-quality-increase" :icon="['fas', 'star']" />
            </p>
            <p class="absolute bottom-0 right-0 px-1 text-sm font-bold text-center rounded-full text-neutral bg-primary bg-opacity-80">
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
          class="rounded-md timeline-end timeline-box bg-primary"
        >
          <div v-for="(crop, collectionIndex) in log.collections" :key="collectionIndex" class="relative w-10 h-10">
            <nuxt-img :src="crop.image" :alt="crop.type" width="64" class="object-contain aspect-square" />
            <p v-if="crop.isStar" class="absolute bottom-0 left-0">
              <font-awesome-icon class="text-xs text-quality-increase" :icon="['fas', 'star']" />
            </p>
            <p class="absolute bottom-0 right-0 px-1 text-sm font-bold text-center rounded-full text-neutral bg-primary bg-opacity-80">
              {{ crop.count }}
            </p>
          </div>
        </div>
        <hr>
      </li>
    </template>
  </ul>
</template>
