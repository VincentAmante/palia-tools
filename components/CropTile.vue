<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { Crop } from '@/assets/scripts/garden-planner/imports'
import { Bonus, CropType, Tile, getCodeFromCrop } from '@/assets/scripts/garden-planner/imports'

const props = defineProps({
  tile: Tile,
  isDisabled: {
    type: Boolean,
    default: false,
  },
  bonusHovered: {
    type: String as PropType<Bonus | null>,
    default: null,
    required: false,
  },
  isAlt: {
    type: Boolean,
    default: false,
  },
})

const code = computed(() => {
  if (props.tile?.crop === null)
    return ' '

  return getCodeFromCrop(props.tile?.crop as Crop)
})

const bonuses = computed(() => {
  if (props.tile === null || props.tile === undefined)
    return []

  return props.tile.bonuses
})

const bgColour = computed(() => {
  switch (props.tile?.crop?.type) {
    case CropType.Tomato:
      return 'bg-blue-700'
    case CropType.Potato:
      return 'bg-blue-800'
    case CropType.Rice:
      return 'bg-green-700'
    case CropType.Wheat:
      return 'bg-green-800'
    case CropType.Corn:
      return 'bg-green-800'
    case CropType.Onion:
      return 'bg-fuchsia-700'
    case CropType.Carrot:
      return 'bg-fuchsia-800'
    case CropType.Cotton:
      return 'bg-amber-600'
    case CropType.SpicyPepper:
      return 'bg-amber-600'
    case CropType.Apple:
      return 'bg-orange-700'
    case CropType.Blueberry:
      return 'bg-orange-700'
    default:
      return ''
  }
})

// Highlights tile if it has the bonus being hovered
const bonusBgColor = computed(() => {
  if (props.tile?.bonuses.length === 0)
    return ''

  if (!(props.tile?.bonuses.includes(props.bonusHovered as Bonus)))
    return ''

  return 'opacity-70 bg-white'
})
</script>

<template>
  <div
    draggable="false"
    class="relative select-none min-w-[3.5rem] md:min-w-[3.75rem] aspect-square bg-base-200 cursor-pointer rounded-lg hover:bg-orange-200 flex flex-col overflow-hidden isolate items-center justify-center"
    :class="[(props.isDisabled ? 'invisible' : ''), (props.isAlt ? 'border-[1px] border-orange-700 border-opacity-50' : '')]"
  >
    <div class="absolute w-full h-full bg-opacity-20 -z-10" :class="bgColour" />
    <div class="lg:text-3xl font-bold uppercase select-none">
      <nuxt-img
        v-if="(tile?.crop?.image && tile?.crop?.image.length > 0)"
        draggable="false" class="select-none p-1 max-w-[42px] md:max-w-[44px]"
        :src="tile?.crop?.image"
      />
      <div v-else>
        {{ code as string || ' ' }}
      </div>
    </div>
    <ul class="absolute top-0 left-0 m-0 text-[9px] md:text-[0.6rem] py-[0.5px] flex w-full gap-[0.8px] px-[2px] md:px-[1.8px] opacity-70">
      <li v-show="bonuses?.includes(Bonus.QualityIncrease)">
        <font-awesome-icon class="text-yellow-200" :icon="['fas', 'star']" />
      </li>
      <li v-show="bonuses?.includes(Bonus.HarvestIncrease)">
        <font-awesome-icon class="text-green-800" :icon="['fas', 'wheat-awn']" />
      </li>
      <li v-show="bonuses?.includes(Bonus.WaterRetain)">
        <font-awesome-icon class="text-sky-200" :icon="['fas', 'droplet']" />
      </li>
      <li v-show="bonuses?.includes(Bonus.WeedPrevention)">
        <font-awesome-icon class=" text-rose-500 " :icon="['fas', 'shield']" />
      </li>
      <li v-show="bonuses?.includes(Bonus.SpeedIncrease)">
        <font-awesome-icon class="text-orange-600" :icon="['fas', 'forward-fast']" />
      </li>
    </ul>
    <div class="absolute bottom-0 right-0 p-[2px]">
      <nuxt-img
        v-if="tile?.fertiliser?.image && tile.fertiliser.image.length > 0"
        format="webp"
        draggable="false" class="select-none max-w-[20px]"
        :src="tile?.fertiliser?.image"
      />
    </div>
    <div
      class=" transition-all w-full absolute h-full -z-20"
      :class="bonusBgColor"
    />
  </div>
</template>
