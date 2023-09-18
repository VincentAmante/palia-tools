<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { Crop } from '@/assets/scripts/garden-planner/imports'
import { Bonus, Tile, getCodeFromCrop } from '@/assets/scripts/garden-planner/imports'

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
  index: {
    type: Number,
    default: 0,
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
  return props.tile?.crop?.cropBackgroundColor || ''
})

// Highlights tile if it has the bonus being hovered
const bonusBgColor = computed(() => {
  if (props.tile?.bonuses.length === 0)
    return ''

  if (!(props.tile?.bonuses.includes(props.bonusHovered as Bonus)))
    return ''

  return 'opacity-100 bg-white'
})

// based on 1-9, decide border corner radius
const borderRadius = computed(() => {
  if (props.index === 1)
    return 'rounded-tl-lg'
  if (props.index === 3)
    return 'rounded-tr-lg'
  if (props.index === 7)
    return 'rounded-bl-lg'
  if (props.index === 9)
    return 'rounded-br-lg'

  return ''
})

// based on 1-9, decide whether a border is needed
const border = computed(() => {
  let style = ''

  // if (props.index === 1)
  //   style += 'border-t border-l'
  // if (props.index === 3)
  //   style += 'border-t border-r'
  // if (props.index === 7)
  //   style += 'border-b border-l'
  // if (props.index === 9)
  //   style += 'border-b border-r'

  switch (props.index) {
    case 1:
      style += 'border-t border-l border-t-[1px]'
      break
    case 2:
      style += 'border-t border-t-[1px] border-l'
      break
    case 3:
      style += 'border-t border-t-[1px] border-r border-l'
      break
    case 4:
      style += 'border-l border-t-[1px] border-l'
      break
    case 5:
      style += 'border-t-[1px] border-l border-t'
      break
    case 6:
      style += 'border-r border-l border-t-[1px] border-r-[1px]'
      break
    case 7:
      style += ' border-b border-l border-t'
      break
    case 8:
      style += 'border-b border-l border-b-[1px] border-t'
      break
    case 9:
      style += 'border-b border-l border-l-[1px] border-r border-b-[1px] border-t'
      break
    default:
      break
  }

  return style
})
</script>

<template>
  <div
    draggable="false"
    class="border-misc-saturated relative select-none min-w-[3rem] sm:min-w-[3.25rem] bg-secondary lg:min-w-[3.45rem] xl:min-w-[3.6rem] 2xl:min-w-[4rem]  aspect-square cursor-pointer hover:bg-orange-200 flex flex-col overflow-hidden isolate items-center justify-center"
    :class="[(isDisabled ? 'invisible' : ''),
             border,
             borderRadius,
    ]"
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
    <ul class="absolute top-0 left-0 m-0 text-[9px] md:text-[0.6rem] py-[0.5px] flex w-full gap-[0.8px] px-[2px] md:px-[1.8px]">
      <li v-show="bonuses?.includes(Bonus.QualityIncrease)">
        <font-awesome-icon class="text-quality-increase" :icon="['fas', 'star']" />
      </li>
      <li v-show="bonuses?.includes(Bonus.HarvestIncrease)">
        <font-awesome-icon class="text-harvest-boost" :icon="['fas', 'wheat-awn']" />
      </li>
      <li v-show="bonuses?.includes(Bonus.WaterRetain)">
        <font-awesome-icon class="text-water-retain" :icon="['fas', 'droplet']" />
      </li>
      <li v-show="bonuses?.includes(Bonus.WeedPrevention)">
        <font-awesome-icon class=" text-weed-prevention" :icon="['fas', 'shield']" />
      </li>
      <li v-show="bonuses?.includes(Bonus.SpeedIncrease)">
        <font-awesome-icon class="text-growth-boost" :icon="['fas', 'forward-fast']" />
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
