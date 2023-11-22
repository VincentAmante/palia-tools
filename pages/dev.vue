<script setup lang="ts">
import { Seeder } from '~/assets/scripts/garden-planner/classes/Crafters/Seeder'
import { CropType, Jar, crops } from '~/assets/scripts/garden-planner/imports'
import { CropItem, ItemType } from '~/assets/scripts/garden-planner/classes/Items/Item'

const seeder = ref(new Seeder())
const jar = ref(new Jar())

const day = ref(1)

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
  jar.value.insertItem({
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
  jar.value.setSettings(settings.value)
})

function seederProcess() {
  seeder.value.process(day.value)
  jar.value.process(day.value)
}
</script>

<template>
  <div class="px-12 py-4 flex flex-col gap-4">
    <section
      class="p-4 bg-warning rounded-md text-neutral font-bold flex flex-col items-center text-center justify-center"
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
        <section class="bg-palia-dark-blue p-2 flex flex-col gap-2 rounded-md border-primary border">
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
                <input v-model="settings[key]" type="checkbox" class="toggle rounded-sm">
                {{ key }}
              </li>
            </template>
            <li>
              <input v-model="day" type="number" class="input w-fit max-w-[8rem]">
              Day
            </li>
          </ul>
        </section>
        <section class="bg-palia-dark-blue p-2 px-4 flex flex-col gap-2 rounded-md border-primary border min-w-[300px]">
          <div>
            <p class="py-2 uppercase">
              Inserted
            </p>

            <ul class="flex bg-accent rounded-md text-misc p-2 gap-2">
              <template v-for="(item, index) in jar.hopperSlots" :key="index">
                <li class="flex items-center relative p-1 bg-primary rounded-md">
                  <NuxtImg v-if="item" :src="item.image" class="w-12 h-12 aspect-square object-contain" />
                  <p class="absolute bottom-0 right-0 m-1 rounded-full text-xs p-1 bg-palia-dark-blue bg-opacity-60 text-primary">
                    {{ item.count }}
                  </p>

                  <font-awesome-icon v-if="item.isStar" icon="star" class="text-quality-increase-dark absolute bottom-0 left-0 m-1" />
                </li>
              </template>
            </ul>
          </div>
          <div>
            <p>
              Output
            </p>
            <ul class="flex bg-accent rounded-md text-misc p-2 gap-2">
              <template v-for="(output, index) in jar.outputSlots" :key="index">
                <li class="flex items-center relative p-1 bg-primary rounded-md">
                  <nuxt-img v-if="output" :src="output.image" class="w-12 h-12 aspect-square object-contain" />
                  <p class="absolute bottom-0 right-0 m-1 rounded-full text-xs p-1 bg-palia-dark-blue bg-opacity-60 text-primary">
                    {{ output.count }}
                  </p>

                  <font-awesome-icon v-if="output.isStar" icon="star" class="text-quality-increase-dark absolute bottom-0 left-0 m-1" />
                </li>
              </template>
            </ul>
          </div>
          <div>
            <p>
              Gold / Day
            </p>
            <p class="flex gap-1 items-center">
              <nuxt-img
                width="16"
                height="16"
                src="/gold.webp" class="max-h-[1rem]"
                :srcset="undefined"
                placeholder
                alt="Gold" format="webp"
              />
              {{ `${Math.floor((jar.goldGenerated ?? 0) / (Math.max(jar.lifeTimeMinutes, 1) / 60)).toLocaleString()}` }}
            </p>
          </div>
        </section>
        <section class="w-fit mockup-code max-w-xl">
          <div class="px-6 py-2">
            <template v-for="(value, key) in jar" :key="key">
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
