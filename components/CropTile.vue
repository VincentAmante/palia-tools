<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import { Bonus, Crop, Fertiliser, Tile, getCodeFromCrop } from '@/assets/scripts/garden-planner/imports'
import { useUiSettings } from '@/stores/useUiSettings'

import { SelectedItemType, useSelectedItem, } from '@/stores/useSelectedItem'


const uiSettings = useUiSettings()

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
    required: false,
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
  return `${props.tile?.crop?.cropBackgroundColor}` || ''
})

const TILE_HIGHLIGHT_STYLE = 'opacity-100 bg-white dark:bg-white/80'
const TILE_NO_HIGHLIGHT_STYLE = ''
// Highlights tile if it has the bonus being hovered
const tileHighlightBgStyle = computed(() => {
  if ((props.tile?.bonuses.includes(props.bonusHovered as Bonus)))
    return TILE_HIGHLIGHT_STYLE

  const hoveredItem = selectedItem.hoverVal

  if (hoveredItem) {
    switch (selectedItem.hoverType) {
      case SelectedItemType.Crop:
        return ((hoveredItem as Crop).type === props.tile?.crop?.type) ? TILE_HIGHLIGHT_STYLE : TILE_NO_HIGHLIGHT_STYLE
      case SelectedItemType.Fertiliser:
        return ((hoveredItem as Fertiliser).effect === props.tile?.fertiliser?.effect) ? TILE_HIGHLIGHT_STYLE : TILE_NO_HIGHLIGHT_STYLE
      default:
        return TILE_NO_HIGHLIGHT_STYLE
    }
  }

  return TILE_NO_HIGHLIGHT_STYLE
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

const showBonusBackground = computed(() => uiSettings.settings.cropTile.showBonusBackground)
const showBonusIcons = computed(() => uiSettings.settings.cropTile.showBonusIcons)

</script>

<template>
  <button
    class="border-misc-saturated dark:border-water-retain relative dark:hover:bg-water-retain/80 select-none min-w-[3rem] xl:min-w-[3.25rem] aspect-square cursor-pointer flex flex-col overflow-hidden isolate items-center justify-center"
    :class="[(isDisabled ? 'invisible' : ''),
      border,
      borderRadius,
    (tile?.isHovered ? 'bg-primary dark:bg-water-retain/80' : 'bg-secondary dark:bg-palia-blue'),
    ]" :aria-label="tile?.crop ? `Tile with ${tile.crop.cropTooltip}` : 'Empty Tile'">
    <div v-show="showBonusBackground" class="absolute w-full h-full -z-10" :class="bgColour" />
    <div class="font-bold uppercase select-none lg:text-3xl">
      <img
v-if="(selectedItem.val instanceof Crop && tile?.isHovered)" format="webp" draggable="false"
        class="select-none p-1 max-w-[38px] md:max-w-[36px] 2xl:max-w-[38px] opacity-50 dark:opacity-60" :src="selectedItem.val.image"
        :srcset="undefined" :alt="selectedItem.val.type">
      <img
v-else-if="(tile?.crop?.image && tile?.crop?.image.length > 0)" width="48px" height="48px" format="webp"
        draggable="false" class="select-none p-1 max-w-[36px] md:max-w-[36px] 2xl:max-w-[38px]" :src="tile?.crop?.image"
        :srcset="undefined" :alt="tile?.crop?.type">
      <div v-else>{{ code as string || 'Empty Tile' }}</div>
    </div>
    <ul
v-show="showBonusIcons"
      class="absolute top-0 left-0 m-0 text-[9px] md:text-[0.5rem] xl:py-[1px] flex w-full gap-[0.6px] xl:gap-[1.3px] justify-center ">
      <li class="sr-only">
        Crop Buffs
      </li>
      <li
v-show="bonuses?.includes(Bonus.SpeedIncrease)" :aria-hidden="bonuses?.includes(Bonus.SpeedIncrease)"
        aria-label="Speed Increase">
        <font-awesome-icon class="text-growth-boost" :icon="['fas', 'forward-fast']" aria-hidden="true" />
      </li>
      <li
v-show="bonuses?.includes(Bonus.HarvestIncrease)" :aria-hidden="bonuses?.includes(Bonus.HarvestIncrease)"
        aria-label="Harvest Increase">
        <font-awesome-icon class="text-harvest-boost-dark dark:text-harvest-boost" :icon="['fas', 'wheat-awn']" aria-hidden="true" />
      </li>
      <li
v-show="bonuses?.includes(Bonus.QualityIncrease)" :aria-hidden="bonuses?.includes(Bonus.QualityIncrease)"
        aria-label="Quality Increase">
        <font-awesome-icon class="text-quality-increase-dark dark:text-quality-increase" :icon="['fas', 'star']" aria-hidden="true" />
      </li>
      <li
v-show="bonuses?.includes(Bonus.WaterRetain)" :aria-hidden="bonuses?.includes(Bonus.WaterRetain)"
        aria-label="Water Retain">
        <font-awesome-icon class="text-water-retain" :icon="['fas', 'droplet']" aria-hidden="true" />
      </li>
      <li
v-show="bonuses?.includes(Bonus.WeedPrevention)" :aria-hidden="bonuses?.includes(Bonus.WeedPrevention)"
        aria-label="Weed Prevention">
        <font-awesome-icon class="text-weed-prevention" :icon="['fas', 'shield']" aria-hidden="true" />
      </li>
    </ul>
    <div class="absolute bottom-0 right-0 p-[2px]">
      <img
v-if="(selectedItem.val instanceof Fertiliser && tile?.isHovered)" :src="selectedItem.val.image"
        draggable="false" class="select-none max-w-[16px] opacity-50 dark:opacity-80" :srcset="undefined"
        :alt="selectedItem.val.effect">
      <img
v-else-if="tile?.fertiliser?.image && tile.fertiliser.image.length > 0" format="webp" draggable="false"
        class="select-none max-w-[16px]" :src="tile?.fertiliser?.image" :srcset="undefined"
        :alt="tile?.fertiliser?.effect">
    </div>
    <div class="absolute w-full h-full transition-all -z-20" :class="tileHighlightBgStyle" />
  </button>
</template>
