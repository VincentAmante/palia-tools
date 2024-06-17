<script setup lang="ts">
import type { SelectedItem } from '~/stores/useSelectedItem'
import { SelectedItemType, getSelectedItemType } from '~/stores/useSelectedItem'
import { Bonus, Crop } from '~/assets/scripts/garden-planner/imports'
import type { Fertiliser } from '~/assets/scripts/garden-planner/imports'
import CropSize from '~/assets/scripts/garden-planner/enums/crop-size'

const props = defineProps<{
  hoveredItem: SelectedItem | null
}>()

const title = computed(() => {
  if (props.hoveredItem === null)
    return ''

  // convert if statements below to switch statement
  switch (getSelectedItemType(props.hoveredItem)) {
    case (SelectedItemType.Crop):
      return (props.hoveredItem as Crop).type
    case (SelectedItemType.CropErase):
      return 'Remove crop from tile(s)'
    case (SelectedItemType.FertiliserErase):
      return 'Remove fertiliser from tile(s)'
    case (SelectedItemType.Fertiliser):
      return (props.hoveredItem as Fertiliser).type
    default:
      return ''
  }
})

function getBonus(bonus: Bonus) {
  switch (bonus) {
    case Bonus.WaterRetain:
      return {
        icon: 'droplet',
        colour: 'text-water-retain',
        type: 'Water Retain',
        extraDetail: 'keeps the surrounding crops watered',
      }
    case Bonus.QualityIncrease:
      return {
        icon: 'star',
        colour: 'text-quality-increase',
        type: 'Quality Increase',
        extraDetail: 'Helps keep other nearby crop types hydrated',
      }
    case Bonus.HarvestIncrease:
      return {
        icon: 'wheat-awn',
        colour: 'text-harvest-boost',
        type: 'Harvest Increase',
        extraDetail: 'Boosts amount harvested from other nearby crop types',
      }
    case Bonus.WeedPrevention:
      return {
        icon: 'shield',
        colour: 'text-weed-prevention',
        type: 'Weed Prevention',
        extraDetail: 'Prevents weeds from growing on other nearby crop types',
      }
    case Bonus.SpeedIncrease:
      return {
        icon: 'forward-fast',
        colour: 'text-growth-boost',
        type: 'Growth Boost',
        extraDetail: 'Boosts growth speed of other nearby crop types',
      }
    default:
      return {
        icon: '',
        colour: 'text-misc',
        type: '',
      }
  }
}

const bonus = computed(() => {
  switch (getSelectedItemType(props.hoveredItem)) {
    case (SelectedItemType.Crop):
      return getBonus((props.hoveredItem as Crop).cropBonus)
    case (SelectedItemType.Fertiliser):
      return getBonus((props.hoveredItem as Fertiliser).effect)
    default:
      return getBonus(Bonus.None)
  }
})

const sizeText = computed(() => {
  if (props.hoveredItem instanceof Crop) {
    switch (props.hoveredItem.size) {
      case CropSize.Single:
        return {
          sizeText: '',
          bonusInfo: '',
        }
      case CropSize.Bush:
        return {
          sizeText: 'Size 2x2',
          bonusInfo: 'needs 2 of a boost for it to apply',
        }
      case CropSize.Tree:
        return {
          sizeText: 'Size 3x3',
          bonusInfo: 'needs 3 of a boost for it to apply',
        }
      default:
        return {
          sizeText: '',
          bonusInfo: '',
        }
    }
  }
  return {
    sizeText: '',
    bonusInfo: '',
  }
})
</script>

<template>
  <div class="flex flex-wrap gap-1 text-palia-dark-blue">
    <p
      v-if="title !== 'Remove crop from tile(s)' && title !== 'Remove fertiliser from tile(s)'"
      class="font-semibold capitalize text-palia-blue"
    >
      {{ title }}
    </p>
    <p v-else class="font-semibold text-palia-blue">
      {{ title }}
    </p>
    <template v-if="bonus.icon !== ''">
      -
      Grants
      <font-awesome-icon :icon="['fas', bonus.icon]" :class="bonus.colour" />
      <span :class="`${bonus.colour} font-semibold capitalize`">
        {{ bonus.type }}
      </span>
      <span class="lowercase">
        which
        {{ bonus.extraDetail }}.

      </span>
    </template>
    <template v-if="sizeText.sizeText">
      <p>
        <span class="font-bold">{{ sizeText.sizeText }}</span>, {{ sizeText.bonusInfo }}.
      </p>
    </template>
  </div>
</template>
