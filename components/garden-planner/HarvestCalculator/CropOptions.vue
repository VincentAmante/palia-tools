<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'
import type { CropType, ICropOption, ICropOptions } from '@/assets/scripts/garden-planner/imports'
import { crops } from '@/assets/scripts/garden-planner/imports'
import { CropOption, CropSortOption, sortCropOptions } from '@/assets/scripts/garden-planner/classes/Crafters/ProduceManager'

const props = defineProps<{
  cropOptions: ICropOptions
}>()

const emit = defineEmits<{
  (e: 'update:cropOptions', value: ICropOptions): void
  (e: 'update:cropOption', value: {
    cropOption: ICropOption
    option: CropOption
  }): void
}>()

const cropOptions = ref<ICropOptions>(props.cropOptions)

const list = ref<HTMLElement | null>(null)
useSortable(list, cropOptions, {
  handle: '.crop-list-handle',
  animation: 200,
  easing: 'cubic-bezier(1, 0, 0, 1)',
})

watchEffect(() => {
  emit('update:cropOptions', cropOptions.value)
})

function getCropImg(crop: CropType, cropOption: CropOption = CropOption.Crop) {
  // return crops[crop]?.image
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
  // cropOption.option = option

  // produceManager.value.setCropOption(cropOption, cropOption.isStar, option)
  emit('update:cropOption', {
    cropOption,
    option,
  })
}

function incrementCrafter(cropOption: ICropOption, option: CropOption) {
  switch (option) {
    case CropOption.Seed:
      cropOption.seeders++
      break
    case CropOption.Preserve:
      cropOption.jars++
      break
  }
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

  emit('update:cropOptions', cropOptions.value)
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

  emit('update:cropOptions', cropOptions.value)
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <section class="text-sm py-2 flex flex-wrap gap-1 items-center">
        <p class="text-palia-blue uppercase font-black text-xs">
          Auto-sort
        </p>
        <button class="btn btn-sm rounded-md normal-case" @click="sortCropOptions(cropOptions, CropSortOption.StarFirst)">
          <span>
            <font-awesome-icon class="text-quality-increase" :icon="['fas', 'star']" />
          </span> First
        </button>
        <button class="btn btn-sm rounded-md normal-case" @click="sortCropOptions(cropOptions, CropSortOption.StarLast)">
          <span>
            <font-awesome-icon class="text-quality-increase" :icon="['fas', 'star']" />
          </span> Last
        </button>
        <button
          class="btn btn-sm rounded-md normal-case" @click="() => {
            cropOptions = sortCropOptions(cropOptions, CropSortOption.Default)
          }"
        >
          Reset
        </button>
      </section>
      <section class="flex flex-wrap gap-1 items-center">
        <p class="text-palia-blue text-xs uppercase font-black">
          Star
        </p>
        <div class="join">
          <button
            class="join-item btn  btn-xs normal-case"
            @click="() => setStarCropOptions(CropOption.Crop)"
          >
            Crop
          </button>
          <button
            class="join-item btn  btn-xs normal-case"
            @click="() => setStarCropOptions(CropOption.Seed)"
          >
            Seed
          </button>
          <button
            class="join-item btn  btn-xs normal-case"
            @click="() => setStarCropOptions(CropOption.Preserve)"
          >
            Jar
          </button>
        </div>

        <p class="text-palia-blue text-xs uppercase font-black">
          Normal
        </p>
        <div class="join">
          <button
            class="join-item btn  btn-xs normal-case"
            @click="() => setNormalCropOptions(CropOption.Crop)"
          >
            Crop
          </button>
          <button
            class="join-item btn  btn-xs normal-case"
            @click="() => setNormalCropOptions(CropOption.Seed)"
          >
            Seed
          </button>
          <button
            class="join-item btn  btn-xs normal-case"
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
        class="bg-secondary text-misc font-bold w-full flex items-center justify-between rounded-sm p-1 select-none py-2"
      >
        <div class="flex items-center">
          <font-awesome-icon
            class="p-1 text-misc object-contain crop-list-handle text-lg cursor-grab"
            :icon="['fas', 'grip-vertical']"
          />
          <div class="relative">
            <nuxt-img
              format="webp" class="w-10 object-contain p-1 py-1 aspect-square" :srcset="undefined" width="1.5rem"
              height="1.5rem" :alt="cropOption.cropType" :src="getCropImg(cropOption.cropType)"
            />
            <font-awesome-icon
              v-if="cropOption.isStar"
              class="text-xs p-1 text-quality-increase object-contain absolute bottom-0" :icon="['fas', 'star']"
            />
          </div>
          <div class="join rounded-md">
            <button
              class="join-item btn  btn-xs normal-case"
              :class="{ ' bg-palia-blue': cropOption.option === CropOption.Crop }"
              @click="setCropOption(cropOption, CropOption.Crop)"
            >
              Crop
            </button>
            <button
              class="join-item btn  btn-xs normal-case"
              :class="{ 'bg-palia-blue': cropOption.option === CropOption.Seed }"
              @click="setCropOption(cropOption, CropOption.Seed)"
            >
              Seed
            </button>
            <button
              v-if="typeHasPreserve(cropOption.cropType)" class="join-item btn  btn-xs normal-case"
              :class="{ 'bg-palia-blue': cropOption.option === CropOption.Preserve }"
              @click="setCropOption(cropOption, CropOption.Preserve)"
            >
              Jar
            </button>
          </div>
        </div>
        <div v-if="cropOption.option !== CropOption.Crop" class="flex">
          <div class="flex flex-col items-center text-accent">
            <input
              v-if="cropOption.option === CropOption.Seed" v-model="cropOption.seeders" type="number" min="0"
              max="100" class=" input  rounded-b-none input-xs text-center text-sm"
            >
            <input
              v-if="cropOption.option === CropOption.Preserve" v-model="cropOption.jars" type="number" min="0"
              max="100" class=" input  rounded-b-none input-xs text-center text-sm"
            >
            <div class="flex w-full rounded-t-none justify-between ">
              <button
                class="btn btn-xs grow rounded-t-none rounded-r-none"
                @click="() => decrementCrafter(cropOption, cropOption.option)"
              >
                <font-awesome-icon class="text-accent" :icon="['fas', 'minus']" />
              </button>

              <button
                class="btn btn-xs grow rounded-t-none rounded-l-none"
                @click="() => incrementCrafter(cropOption, cropOption.option)"
              >
                <font-awesome-icon class="text-accent" :icon="['fas', 'plus']" />
              </button>
            </div>
          </div>
          <nuxt-img
            format="webp" class="w-12 object-contain p-1 py-1 aspect-square" :srcset="undefined" width="1.5rem"
            height="1.5rem" :alt="cropOption.cropType" :src="getCrafterImage(cropOption.option)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>
