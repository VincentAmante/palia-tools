<script setup lang="ts">
import { Seeder } from '~/assets/scripts/garden-planner/classes/crafters/Seeder'
import { CropItem, ItemType } from '~/assets/scripts/garden-planner/classes/items/item'
import { CropType, crops } from '~/assets/scripts/garden-planner/imports'

const seeder = ref(new Seeder())

const tomato = crops[CropType.Tomato]
const crop = ref(new CropItem(
  CropType.Tomato,
  ItemType.Crop,
  tomato.image,
  tomato.goldValues.cropStar,
  true,
  30,
  30,
  CropType.Tomato,
))

function addTomato() {
  seeder.value.insertItem({
    item: crop.value as CropItem,
    day: 1,
  })
}

const settings = ref({
  useStackLimit: true,
  useHopperLimit: true,
  includeNormalSeeds: true,
})

watchEffect(() => {
  seeder.value.setSettings(settings.value)
})

function seederProcess() {
  seeder.value.process()
}
</script>

<template>
  <div class="flex flex-col gap-4 px-12 py-4">
    <section
      class="flex flex-col items-center justify-center p-4 font-bold text-center rounded-md bg-warning text-neutral"
    >
      <font-awesome-icon icon="exclamation-triangle" class="text-4xl" />
      <h1 class="text-2xl uppercase">
        You have reached the dev test page
      </h1>
      <p class="max-w-xl font-normal">
        The contents of this page outside of this message are only
        visible to those who are running this website on dev mode
      </p>
    </section>
    <DevOnly>
      <div class="flex gap-2">
        <section class="flex flex-col gap-2 p-2 border rounded-md bg-palia-dark-blue border-primary">
          <input v-model="crop.count" type="number" class="input">
          <button class="btn btn-primary" @click="addTomato">
            Add Tomato
          </button>
          <button class="btn btn-primary" @click="seederProcess">
            Process
          </button>

          <ul class="grid gap-1">
            <template v-for="(setting, key) in settings" :key="key">
              <li class="flex items-center gap-2">
                <input v-model="settings[key]" type="checkbox" class="rounded-sm toggle">
                {{ key }}
              </li>
            </template>
          </ul>
        </section>
        <section class="flex flex-col gap-2 p-2 border rounded-md bg-palia-dark-blue border-primary">
          <div>
            <p>
              Tomatoes in Insert Hopper
            </p>
            <div class="flex items-center">
              <img v-if="seeder.hopperSlots[0]" :src="seeder.hopperSlots[0]?.image" class="w-12 h-12">
              {{ seeder.hopperSlots[0]?.count }}
            </div>
          </div>
          <div>
            <p>
              Output
            </p>
            <div class="flex gap-2">
              <template v-for="(output, index) in seeder.outputSlots" :key="index">
                <li class="flex items-center gap-1 p-2 rounded-md bg-primary text-neutral">
                  <div class="flex flex-col font-bold">
                    <font-awesome-icon v-if="output.isStar" icon="star" class="text-quality-increase-dark" />
                    {{ output.count }}
                  </div>
                  <img v-if="output" :src="output.image" class="w-12 h-12">
                </li>
              </template>
            </div>
          </div>
        </section>
        <section class="max-w-xl w-fit mockup-code">
          <div class="px-6 py-2">
            <template v-for="(value, key) in seeder" :key="key">
              <span class="block">
                {{ key }}: {{ value }}
              </span>
            </template>
          </div>
        </section>
      </div>
    </DevOnly>
  </div>
</template>
