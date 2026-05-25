<script setup lang="ts">
import { computed } from 'vue'
import { SelectedItemType, useSelectedItem } from '@/stores/useSelectedItem';
import useGardenGrid from '@/stores/useGardenGrid';
import { toCoordinateObject, type Coordinates } from '~/assets/scripts/garden-planner/classes/gardenGrid';
import type { PropType } from 'vue';
import type { Fertiliser, Crop } from '~/assets/scripts/garden-planner/imports';
import { Bonus } from '~/assets/scripts/garden-planner/imports';

import { useUiSettings } from '@/stores/useUiSettings'
import CropSize from '~/assets/scripts/garden-planner/enums/crop-size';
import { useMouseTracker } from '~/stores/useMouseTracker';


const emit = defineEmits(['update'])

const gardenGrid = useGardenGrid()
const selectedItem = useSelectedItem()
const uiSettings = useUiSettings()
const mouseTracker = useMouseTracker()

const TILE_HIGHLIGHT_STYLE = 'opacity-100 bg-white dark:bg-white/80'
const TILE_NO_HIGHLIGHT_STYLE = ''

const props = defineProps({
    coordinates: {
        type: String as PropType<Coordinates>,
        required: true
    }
})

const tileData = computed(() => {
    const version = gardenGrid.tileVersions.get(props.coordinates)
    const tile = gardenGrid.grid.getTile(props.coordinates)

    return {
        tile: tile,
        version: version,
        type: tile?.attachedCrop?.crop.type
    }
})


const tileRadiusByPlot = computed(() => {
    const plotLocalCoordinates = tileData.value.tile?.plotLocalCoordinates
    const style = ['rounded-none']

    if (!plotLocalCoordinates) return style.join(' ')
    if (!tileData.value.tile) return style.join(' ')


    switch(plotLocalCoordinates){
        case '0,0':
            style.push('rounded-tl')
            break;
        case '2,0':
            style.push('rounded-tr')
            break;
        case '0,2':
            style.push('rounded-bl')
            break;
        case '2,2':
            style.push('rounded-br')
            break
    }

    return style.join(' ')
})
const tileBorderWeightByPlot = computed(() => {
    const plotLocalCoordinates = tileData.value.tile?.plotLocalCoordinates
    const style = ['']

    if (!plotLocalCoordinates) return style.join(' ')

    const coordsObj = toCoordinateObject(plotLocalCoordinates)

    if (coordsObj.y === 0) style.push('border-t')
    if (coordsObj.y === 2) style.push('border-b')
    if (coordsObj.x === 0) style.push('border-l')
    if (coordsObj.x === 2) style.push('border-r')

    return style.join(' ')
})

const showBonusBackground = computed(() => uiSettings.settings.cropTile.showBonusBackground)
const showBonusIcons = computed(() => uiSettings.settings.cropTile.showBonusIcons)

const borderColour = computed(() => {
    const tile = tileData.value.tile
    const crop = tile?.attachedCrop?.crop

    if (!crop || !tile) return 'border-misc-saturated/90 dark:border-water-retain/80'
    if (tile.hoverState === 'DELETE') return 'border-weed-prevention'
    if (!showBonusBackground.value) return 'border-misc dark:border-water-retain/20'

    switch (crop.cropBonus) {
        // case Bonus.HarvestIncrease:
        //     return 'border-harvest-boost-dark dark:border-harvest-boost'
        // case Bonus.WaterRetain:
        //     return 'border-water-retain dark:border-water-retain'
        // case Bonus.WeedPrevention:
        //     return 'border-weed-prevention border-weed-prevention'
        // case Bonus.QualityIncrease:
        //     return 'border-quality-increase-dark dark:border-quality-increase'
        // case Bonus.SpeedIncrease:
        //     return 'border-growth-boost-dark dark:border-growth-boost'
        default:
            return 'border-misc-saturated/80 dark:border-water-retain/80'
    }
})

const isAdjacentTileTheSame = computed(() => {
    const tile = tileData.value.tile

    if (!tile) return {
        north: false,
        east: false,
        west: false,
        south: false
    }

    return gardenGrid.grid.fetchWhichNeighboursAreOfTheSameTypeBoolean(tile?.coordinates, false)
})

const altCropBorder = computed(() => {
    const tile = tileData.value.tile

    const style = ['border-0']

    if (!tile) return style


    // Rounded corners
    // if (!isAdjacentTileTheSame.value.north && !isAdjacentTileTheSsame.value.east) style.push('rounded-br');

    if (!isAdjacentTileTheSame.value.north) style.push('border-t')
    // if (!isAdjacentTileTheSame.value.east) style.push('border-r')
    if (!isAdjacentTileTheSame.value.west) style.push('border-l')
    // if (!isAdjacentTileTheSame.value.south) style.push('border-b')

    if (!tile.attachedCrop) {
        if (isAdjacentTileTheSame.value.east) style.push('border-r')
        if (isAdjacentTileTheSame.value.south) style.push('border-b')
    }

    return style.join(' ')
})

const cropPadding = computed(() => {
    const tile = tileData.value.tile

    const base = ''

    if (!tile) {
        return ''
    }

    const style = [base]

    if (isAdjacentTileTheSame.value.north) style.push('pt-0')
    if (isAdjacentTileTheSame.value.east) style.push('pr-0')
    if (isAdjacentTileTheSame.value.west) style.push('pl-0')
    if (isAdjacentTileTheSame.value.south) style.push('pb-0')

    return style.join(' ')
})


const backgroundColourByHover = computed(() => {
    switch (tileData.value.tile?.hoverState) {
        case 'DEFAULT':
            return 'bg-misc-saturated/60 dark:bg-water-retain/80'
        case 'NONE':
        default:
            return 'bg-secondary dark:bg-palia-blue'
    }
})


const bgColour = computed(() => {
    if (tileData.value.tile?.hoverState === 'DELETE' || tileData.value.tile?.hoverState === 'INVALID')
        return 'bg-weed-prevention/60'

    if (!showBonusBackground.value) return 'bg-secondary dark:bg-palia-blue'

    return `${tileData.value.tile?.crop?.cropBackgroundColor}` || ''
})


function handleLeftClick() {
    switch (selectedItem.type) {
        case SelectedItemType.Crop:
            gardenGrid.placeCrop(props.coordinates, selectedItem.val as Crop)
            break;
        case SelectedItemType.CropErase:
            gardenGrid.placeCrop(props.coordinates, null)
            break
        case SelectedItemType.Fertiliser:
            gardenGrid.placeFertiliser(props.coordinates, selectedItem.val as Fertiliser)
            break;
        case SelectedItemType.FertiliserErase:
            gardenGrid.placeFertiliser(props.coordinates, null)
    }

    emit('update')
}

function handleRightClick() {

    if (!tileData.value.tile) return

    const tile = tileData.value.tile

    if (tile.fertiliser)
        gardenGrid.placeFertiliser(tile.coordinates, null)
    else if (tile.attachedCrop)
        gardenGrid.placeCrop(tile.coordinates, null)


    emit('update')
}


function handleDrag() {
    if (!tileData.value.tile) {
        return
    }

    if (mouseTracker.left && !mouseTracker.right) {
        switch (selectedItem.type) {
            case SelectedItemType.Crop:
                gardenGrid.placeCrop(props.coordinates, selectedItem.val as Crop, {
                    blockPlacingUnlessCropHasLesserPlacementPriority: true
                })
                break;
            case SelectedItemType.CropErase:
                gardenGrid.placeCrop(props.coordinates, null)
                break
            case SelectedItemType.Fertiliser:
                gardenGrid.placeFertiliser(props.coordinates, selectedItem.val as Fertiliser)
                break;
            case SelectedItemType.FertiliserErase:
                gardenGrid.placeFertiliser(props.coordinates, null)
        }


        emit('update')
    }
    else if (mouseTracker.right && !mouseTracker.left) {
        handleRightClick()


        emit('update')
    }

}

function handleHover() {

    if (!tileData.value.tile) {
        return
    }

    switch (selectedItem.type) {
        case SelectedItemType.Crop:
            gardenGrid.hoverTile(tileData.value.tile.coordinates, selectedItem.val as Crop)
            break
        case SelectedItemType.Fertiliser:
            gardenGrid.hoverTile(tileData.value.tile.coordinates, selectedItem.val as Fertiliser)
            break
        default:
            gardenGrid.hoverTile(tileData.value.tile.coordinates)
    }

    handleDrag()
}


function handleUnhover() {
    gardenGrid.unhoverTile()

    handleDrag()
}

function handleMiddleClick(event: MouseEvent) {
}

const TILE_SIZE = '48px'

const displayImageByCropSize = computed(() => {
    const style: string[] = []

    const tile = tileData.value.tile
    if (!tile) return style.join(' ')
    const size = tileData.value.tile?.crop?.size


    if (!size) return style.join(' ')


    const isBotRightTile = (!isAdjacentTileTheSame.value.south && !isAdjacentTileTheSame.value.east)

    if (!isBotRightTile) style.push('hidden')

    switch (size) {
        case CropSize.Bush:
            style.push('-translate-6', 'scale-150')
            break;
        case CropSize.Tree:
            style.push('-translate-12', 'scale-175')
            break;
        case CropSize.Single:
        default:
            break;

    }
    return style.join(' ')
})

const displayBonusesByCropSize = computed(() => {
    const style: string[] = []

    const tile = tileData.value.tile
    if (!tile) return style.join(' ')
    const size = tileData.value.tile?.crop?.size


    if (!size) return style.join(' ')

    const isBotRightTile = (!isAdjacentTileTheSame.value.south && !isAdjacentTileTheSame.value.east)

    if (!isBotRightTile) style.push('hidden')

    switch (size) {
        case CropSize.Bush:
            style.push('-translate-y-12 -translate-x-6', 'scale-150')
            break;
        case CropSize.Tree:
            style.push('-translate-y-24 -translate-x-12', 'scale-175')
            break;
        case CropSize.Single:
        default:
            break;

    }
    return style.join(' ')
})

const displayFertiliserByCropSize = computed(() => {
    const style: string[] = []

    const tile = tileData.value.tile
    if (!tile) return style.join(' ')
    const size = tileData.value.tile?.crop?.size


    if (!size) return style.join(' ')


    const isBotRightTile = (!isAdjacentTileTheSame.value.south && !isAdjacentTileTheSame.value.east)

    if (!isBotRightTile) style.push('hidden')

    switch (size) {
        case CropSize.Bush:
            style.push('-translate-0.5', 'scale-125')
            break;
        case CropSize.Tree:
            style.push('-translate-1', 'scale-150')
            break;
        case CropSize.Single:
        default:
            break;

    }
    return style.join(' ')
})

</script>

<template>
    <div
:aria-label="`Tile at ${coordinates}`"
        class="w-12 xl:w-13 aspect-square items-center  justify-center  border-misc-saturated/80 dark:border-water-retain/80 relative select-none"
        :class="[tileBorderWeightByPlot, tileRadiusByPlot]">
        <button
v-if="tileData.tile"
            class="flex items-center justify-center border-0 w-full h-full relative isolate rounded-none"
            :class="[backgroundColourByHover, tileRadiusByPlot, (tileData.tile.hoverState === 'INVALID' ? 'cursor-not-allowed' : 'cursor-pointer')]"
            @mousedown.middle.prevent.stop @click.left="handleLeftClick" @click.right="handleRightClick"
            @contextmenu.stop.prevent @mouseenter="handleHover" @mouseleave="handleUnhover">
            <!-- <p class="absolute bot-0 right-0 text-xs">{{ tileData.tile.plotLocalCoordinates }}</p> -->
            <!-- <p class="absolute top-0 left-0 text-xs">{{ tileData.version }}</p> -->
            <!-- <p>{{ tileData.type }}</p> -->
            <!-- <p>{{ tileData.tile.hoverState }}</p> -->
            <!-- <p>{{ cropRelativeCoords }}</p> -->
            <img
v-if="(selectedItem.val && selectedItem.type === SelectedItemType.Crop && (tileData.tile?.hoverState === 'DEFAULT' || tileData.tile?.hoverState === 'INVALID'))"
                format="webp" draggable="false"
                class="absolute select-none p-1 max-w-9.5 md:max-w-9 2xl:max-w-9.5 opacity-80 pointer-events-none dark:opacity-60"
                :src="(selectedItem.val as Crop).image" :srcset="undefined" :alt="(selectedItem.val as Crop).type">
            <img
v-if="(tileData.tile.crop?.image && tileData.tile.crop?.image.length > 0)" width="48px" height="48px"
                format="webp" draggable="false"
                class="absolute select-none pointer-events-none p-1 -z-10 max-w-9 md:max-w-9 2xl:max-w-9.5"
                :class="[tileData.tile.hoverState !== 'NONE' ? ' opacity-20' : '', displayImageByCropSize]"
                :src="tileData.tile.crop?.image" :srcset="undefined" :alt="tileData.tile.crop?.type">
            <div class="absolute pointer-events-none -z-20 w-full h-full" :class="[cropPadding]">
                <div class="w-full h-full " :class="[bgColour, altCropBorder, borderColour]" />
            </div>
            <ul
v-show="showBonusIcons" :class="displayBonusesByCropSize"
                class="absolute top-px left-px m-0 text-[9px] md:text-[0.5rem] xl:py-px flex w-full gap-0 justify-center pointer-events-none">
                <li class="sr-only">
                    Crop Buffs
                </li>
                <li
v-show="tileData.tile.attachedCrop?.bonuses.has(Bonus.SpeedIncrease)"
                    :aria-hidden="tileData.tile.attachedCrop?.bonuses.has(Bonus.SpeedIncrease)"
                    aria-label="Speed Increase">
                    <font-awesome-icon class="text-growth-boost" :icon="['fas', 'forward-fast']" aria-hidden="true" />
                </li>
                <li
v-show="tileData.tile.attachedCrop?.bonuses.has(Bonus.HarvestIncrease)"
                    :aria-hidden="tileData.tile.attachedCrop?.bonuses.has(Bonus.HarvestIncrease)"
                    aria-label="Harvest Increase">
                    <font-awesome-icon
class="text-harvest-boost-dark dark:text-harvest-boost"
                        :icon="['fas', 'wheat-awn']" aria-hidden="true" />
                </li>
                <li
v-show="tileData.tile.attachedCrop?.bonuses.has(Bonus.QualityIncrease)"
                    :aria-hidden="tileData.tile.attachedCrop?.bonuses.has(Bonus.QualityIncrease)"
                    aria-label="Quality Increase">
                    <font-awesome-icon
class="text-quality-increase-dark dark:text-quality-increase"
                        :icon="['fas', 'star']" aria-hidden="true" />
                </li>
                <li
v-show="tileData.tile.attachedCrop?.bonuses.has(Bonus.WaterRetain)"
                    :aria-hidden="tileData.tile.attachedCrop?.bonuses.has(Bonus.WaterRetain)" aria-label="Water Retain">
                    <font-awesome-icon class="text-water-retain" :icon="['fas', 'droplet']" aria-hidden="true" />
                </li>
                <li
v-show="tileData.tile.attachedCrop?.bonuses.has(Bonus.WeedPrevention)"
                    :aria-hidden="tileData.tile.attachedCrop?.bonuses.has(Bonus.WeedPrevention)"
                    aria-label="Weed Prevention">
                    <font-awesome-icon class="text-weed-prevention" :icon="['fas', 'shield']" aria-hidden="true" />
                </li>
            </ul>
            <div class="absolute bottom-0 right-0 p-0.5" :class="displayFertiliserByCropSize">
                <img
v-if="(selectedItem.val && selectedItem.type === SelectedItemType.Fertiliser && tileData.tile?.isHovered)"
                    :src="(selectedItem.val as Fertiliser).image" draggable="false"
                    class="select-none max-w-4 opacity-50 dark:opacity-80" :srcset="undefined"
                    :alt="(selectedItem.val as Fertiliser).effect">
                <img
v-else-if="tileData.tile?.fertiliser?.image && tileData.tile?.fertiliser.image.length > 0"
                    format="webp" draggable="false" class="select-none max-w-4" :src="tileData.tile?.fertiliser?.image"
                    :srcset="undefined" :alt="tileData.tile?.fertiliser?.effect">
            </div>
        </button>
    </div>
</template>