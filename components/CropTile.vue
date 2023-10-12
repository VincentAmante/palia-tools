<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import { Bonus, Crop, Fertiliser, Tile, getCodeFromCrop } from '@/assets/scripts/garden-planner/imports'

import { useSelectedItem } from '@/stores/useSelectedItem'

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
const selectedItem = useSelectedItem()
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
    class="border-misc-saturated relative select-none min-w-[3.2rem] hover:bg-primary aspect-square cursor-pointer flex flex-col overflow-hidden isolate items-center justify-center"
    :class="[(isDisabled ? 'invisible' : ''),
             border,
             borderRadius,
             (tile?.isHovered ? 'bg-primary' : ' bg-secondary'),
    ]"
  >
    <div class="absolute w-full h-full bg-opacity-20 -z-10" :class="bgColour" />
    <div class="lg:text-3xl font-bold uppercase select-none">
      <nuxt-img
        v-if="(selectedItem.val instanceof Crop && tile?.isHovered)"
        format="webp"
        draggable="false" class="select-none p-1 max-w-[38px] md:max-w-[40px] 2xl:max-w-[44px] opacity-50"
        :src="selectedItem.val.image"
        :srcset="undefined"
      />
      <nuxt-img
        v-else-if="(tile?.crop?.image && tile?.crop?.image.length > 0)" width="48px" height="48px"
        format="webp"
        draggable="false" class="select-none p-1 max-w-[38px] md:max-w-[40px] 2xl:max-w-[44px]"
        :src="tile?.crop?.image"
        :srcset="undefined"
      />
      <div v-else>
        {{ code as string || ' ' }}
      </div>
    </div>
    <ul class="absolute top-0 left-0 m-0 text-[9px] md:text-[0.5rem] py-[1px] flex w-full gap-[1.3px] justify-center">
      <li v-show="bonuses?.includes(Bonus.HarvestIncrease)">
        <font-awesome-icon class="text-harvest-boost-dark" :icon="['fas', 'wheat-awn']" />
      </li>
      <li v-show="bonuses?.includes(Bonus.SpeedIncrease)">
        <font-awesome-icon class="text-growth-boost" :icon="['fas', 'forward-fast']" />
      </li>
      <li v-show="bonuses?.includes(Bonus.QualityIncrease)">
        <font-awesome-icon class="text-quality-increase-dark" :icon="['fas', 'star']" />
      </li>
      <li v-show="bonuses?.includes(Bonus.WaterRetain)">
        <font-awesome-icon class="text-water-retain" :icon="['fas', 'droplet']" />
      </li>
      <li v-show="bonuses?.includes(Bonus.WeedPrevention)">
        <font-awesome-icon class=" text-weed-prevention" :icon="['fas', 'shield']" />
      </li>
    </ul>
    <div class="absolute bottom-0 right-0 p-[2px]">
      <nuxt-img
        v-if="(selectedItem.val instanceof Fertiliser && tile?.isHovered)"
        :src="selectedItem.val.image"
        format="webp"
        draggable="false" class="select-none max-w-[16px] opacity-50"
        :srcset="undefined"
      />
      <nuxt-img
        v-else-if="tile?.fertiliser?.image && tile.fertiliser.image.length > 0"
        format="webp"
        draggable="false" class="select-none max-w-[16px]"
        :src="tile?.fertiliser?.image"
        :srcset="undefined"
      />
    </div>
    <div
      class=" transition-all w-full absolute h-full -z-20"
      :class="bonusBgColor"
    />
  </div>
</template>
