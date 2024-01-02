<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'
import type { CropType, ICropOption, ICropOptions } from '@/assets/scripts/garden-planner/imports'
import { crops } from '@/assets/scripts/garden-planner/imports'
import { CropOption, CropSortOption, sortCropOptions } from '@/assets/scripts/garden-planner/classes/Crafters/ProduceManager'

const props = defineProps<{
  cropOptions: ICropOptions
  hasMaxCrafterLimit: boolean
  isDedicated: boolean

}>()

const emit = defineEmits<{
  (e: 'update:cropOptions', value: ICropOptions): void
  (e: 'update:cropOption', value: {
    cropOption: ICropOption
    option: CropOption
  }): void
}>()

const MAX_CRAFTER_LIMIT = 30

const cropOptions = ref<ICropOptions>(props.cropOptions)

const crafterCount = computed(() => {
  let count = 0
  for (const cropOption of cropOptions.value) {
    if (cropOption.option === CropOption.Seed)
      count += cropOption.seeders
    else if (cropOption.option === CropOption.Preserve)
      count += cropOption.jars
  }

  return count
})

const list = ref<HTMLElement | null>(null)
useSortable(list, cropOptions, {
  handle: '.crop-list-handle',
  animation: 200,
  easing: 'cubic-bezier(1, 0, 0, 1)',
})

function onChange() {
  const optionsReverse = cropOptions.value.toReversed()

  // If over the limit, trim the crafters based on the priority order

  if (crafterCount.value > MAX_CRAFTER_LIMIT) {
    for (const cropOption of optionsReverse) {
      if (crafterCount.value <= MAX_CRAFTER_LIMIT)
        break

      if (cropOption.option === CropOption.Seed) {
        if (cropOption.seeders > 1)
          cropOption.seeders--
      }
      else if (cropOption.option === CropOption.Preserve) {
        if (cropOption.jars > 1)
          cropOption.jars--
      }
    }
  }

  emit('update:cropOptions', cropOptions.value)
}

function getCropImg(crop: CropType, cropOption: CropOption = CropOption.Crop) {
  switch (cropOption) {
    case CropOption.Crop:
      return crops[crop]?.image
    case CropOption.Seed:
      return crops[crop]?.seedImage
    case CropOption.Preserve:
      return crops[crop]?.preserveImage
  }
}

function typeHasPreserve(type: CropType) {
  return crops[type]?.goldValues?.hasPreserve
}

function setCropOption(cropOption: ICropOption, option: CropOption) {
  emit('update:cropOption', {
    cropOption,
    option,
  })

  nextTick(() => {
    onChange()
  })
}

function incrementCrafter(cropOption: ICropOption, option: CropOption) {
  const limit = props.hasMaxCrafterLimit ? MAX_CRAFTER_LIMIT : Number.POSITIVE_INFINITY

  switch (option) {
    case CropOption.Seed:
      if (crafterCount.value < limit)
        cropOption.seeders++
      break
    case CropOption.Preserve:
      if (crafterCount.value < limit)
        cropOption.jars++
      break
  }

  onChange()
}

function decrementCrafter(cropOption: ICropOption, option: CropOption) {
  switch (option) {
    case CropOption.Seed:
      if (cropOption.seeders > 1)
        cropOption.seeders--
      break
    case CropOption.Preserve:
      if (cropOption.jars > 1)
        cropOption.jars--
      break
  }

  onChange()
}

function getCrafterImage(option: CropOption) {
  switch (option) {
    case CropOption.Seed:
      return '/crafters/seeder.webp'
    case CropOption.Preserve:
      return '/crafters/preserve-jar.webp'
  }
}

function setStarCropOptions(cropOption: CropOption) {
  for (const crop of cropOptions.value) {
    if (crop.isStar) {
      // This kinda ugly but it works
      if (cropOption === CropOption.Preserve) {
        if (crops[crop.cropType]?.goldValues?.hasPreserve)
          crop.option = CropOption.Preserve
      }
      else {
        crop.option = cropOption
      }
    }
  }

  onChange()
}

function setNormalCropOptions(cropOption: CropOption) {
  for (const crop of cropOptions.value) {
    if (!crop.isStar) {
      if (cropOption === CropOption.Preserve) {
        if (crops[crop.cropType]?.goldValues?.hasPreserve)
          crop.option = CropOption.Preserve
      }
      else {
        crop.option = cropOption
      }
    }
  }

  onChange()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <section class="flex flex-wrap items-center gap-1 py-2 text-sm">
        <p class="text-xs font-black uppercase text-palia-blue">
          Auto-sort
        </p>
        <button class="normal-case rounded-md btn btn-sm" @click="sortCropOptions(cropOptions, CropSortOption.StarFirst)">
          <span>
            <font-awesome-icon class="text-quality-increase" :icon="['fas', 'star']" />
          </span> First
        </button>
        <button class="normal-case rounded-md btn btn-sm" @click="sortCropOptions(cropOptions, CropSortOption.StarLast)">
          <span>
            <font-awesome-icon class="text-quality-increase" :icon="['fas', 'star']" />
          </span> Last
        </button>
        <button
          class="normal-case rounded-md btn btn-sm" @click="() => {
            cropOptions = sortCropOptions(cropOptions, CropSortOption.Default)
          }"
        >
          Reset
        </button>
      </section>
      <section class="flex flex-wrap items-center gap-1">
        <p class="text-xs font-black uppercase text-palia-blue">
          Star
        </p>
        <div class="join">
          <button
            class="normal-case join-item btn btn-xs"
            @click="() => setStarCropOptions(CropOption.Crop)"
          >
            Crop
          </button>
          <button
            class="normal-case join-item btn btn-xs"
            @click="() => setStarCropOptions(CropOption.Seed)"
          >
            Seed
          </button>
          <button
            class="normal-case join-item btn btn-xs"
            @click="() => setStarCropOptions(CropOption.Preserve)"
          >
            Jar
          </button>
        </div>

        <p class="text-xs font-black uppercase text-palia-blue">
          Normal
        </p>
        <div class="join">
          <button
            class="normal-case join-item btn btn-xs"
            @click="() => setNormalCropOptions(CropOption.Crop)"
          >
            Crop
          </button>
          <button
            class="normal-case join-item btn btn-xs"
            @click="() => setNormalCropOptions(CropOption.Seed)"
          >
            Seed
          </button>
          <button
            class="normal-case join-item btn btn-xs"
            @click="() => setNormalCropOptions(CropOption.Preserve)"
          >
            Jar
          </button>
        </div>
      </section>
    </div>

    <ul ref="list" class="grid gap-1">
      <li
        v-for="
          (cropOption) in cropOptions
        " :key="`${cropOption.cropType}-${cropOption.isStar}`"
        class="flex items-center justify-between w-full p-1 py-2 font-bold rounded-sm select-none bg-secondary text-misc"
      >
        <div class="flex items-center">
          <font-awesome-icon
            class="object-contain p-1 text-lg text-misc crop-list-handle cursor-grab"
            :icon="['fas', 'grip-vertical']"
          />
          <div class="relative">
            <nuxt-img
              format="webp" class="object-contain w-10 p-1 py-1 aspect-square" :srcset="undefined" width="1.5rem"
              height="1.5rem" :alt="cropOption.cropType" :src="getCropImg(cropOption.cropType)"
            />
            <font-awesome-icon
              v-if="cropOption.isStar"
              class="absolute bottom-0 object-contain p-1 text-xs text-quality-increase" :icon="['fas', 'star']"
            />
          </div>
          <div class="rounded-md join">
            <button
              class="normal-case join-item btn btn-xs"
              :class="{ ' bg-palia-blue': cropOption.option === CropOption.Crop }"
              @click="setCropOption(cropOption, CropOption.Crop)"
            >
              Crop
            </button>
            <button
              class="normal-case join-item btn btn-xs"
              :class="{ 'bg-palia-blue': cropOption.option === CropOption.Seed }"
              @click="setCropOption(cropOption, CropOption.Seed)"
            >
              Seed
            </button>
            <button
              v-if="typeHasPreserve(cropOption.cropType)" class="normal-case join-item btn btn-xs"
              :class="{ 'bg-palia-blue': cropOption.option === CropOption.Preserve }"
              @click="setCropOption(cropOption, CropOption.Preserve)"
            >
              Jar
            </button>
          </div>
        </div>
        <div
          v-if="(cropOption.option !== CropOption.Crop && isDedicated)" class="flex"
        >
          <div class="flex flex-col items-center text-accent">
            <input
              v-if="cropOption.option === CropOption.Seed"
              v-model="cropOption.seeders" type="number" min="0"
              max="100"
              class="text-sm text-center rounded-b-none  input input-xs" @change="onChange"
            >
            <input
              v-if="cropOption.option === CropOption.Preserve" v-model="cropOption.jars" type="number" min="0"
              max="100" class="text-sm text-center rounded-b-none  input input-xs"
              @change="onChange"
            >
            <div class="flex justify-between w-full rounded-t-none ">
              <button
                class="rounded-t-none rounded-r-none btn btn-xs grow"
                @click="() => decrementCrafter(cropOption, cropOption.option)"
              >
                <font-awesome-icon class="text-accent" :icon="['fas', 'minus']" />
              </button>

              <button
                class="rounded-t-none rounded-l-none btn btn-xs grow"
                @click="() => incrementCrafter(cropOption, cropOption.option)"
              >
                <font-awesome-icon class="text-accent" :icon="['fas', 'plus']" />
              </button>
            </div>
          </div>
          <nuxt-img
            format="webp" class="object-contain w-12 p-1 py-1 aspect-square" :srcset="undefined" width="1.5rem"
            height="1.5rem" :alt="cropOption.cropType" :src="getCrafterImage(cropOption.option)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>
