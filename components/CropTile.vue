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
    case CropType.Onion:
      return 'bg-fuchsia-700'
    case CropType.Carrot:
      return 'bg-fuchsia-800'
    case CropType.Cotton:
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

  // For now it's white, but I might change it to a more visible colour
  return 'opacity-70 bg-white'
})
</script>

<template>
  <div
    draggable="false"
    class="relative select-none min-w-[3.5rem] aspect-square bg-base-200 cursor-pointer rounded-lg hover:bg-orange-200 flex flex-col overflow-hidden isolate items-center justify-center"
    :class="[(props.isDisabled ? 'invisible' : ''), (props.isAlt ? 'border-[1px] border-orange-700 border-opacity-50' : '')]"
  >
    <div class="absolute w-full h-full bg-opacity-20 -z-10" :class="bgColour" />
    <div class="lg:text-3xl font-bold uppercase select-none">
      <img v-if="(tile?.crop?.image && tile?.crop?.image.length > 0)" draggable="false" class="select-none p-1 max-w-[48px]" :src="tile?.crop?.image">
      <div v-else>
        {{ code as string || ' ' }}
      </div>
    </div>
    <ul class="absolute top-0 left-0 m-0 text-[10px] lg:text-[0.65rem] py-[0.5px] flex w-full gap-[2px] px-1">
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
        <font-awesome-icon class="text-orange-500" :icon="['fas', 'forward-fast']" />
      </li>
    </ul>
    <div
      class=" transition-all w-full absolute h-full -z-20"
      :class="bonusBgColor"
    />
  </div>
</template>
