<script setup lang="ts">
import { computed } from 'vue'
import { SelectedItemType, useSelectedItem } from '@/stores/useSelectedItem';
import useGardenGrid from '@/stores/useGardenGrid';
import { toCoordinateObject, type Coordinates } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import type { PropType } from 'vue';
import type { Fertiliser, Crop } from '~/assets/scripts/garden-planner/imports';
import { Bonus } from '~/assets/scripts/garden-planner/imports';

import { useUiSettings } from '@/stores/useUiSettings'
import CropSize from '~/assets/scripts/garden-planner/enums/crop-size';
import { useMouseTracker } from '~/stores/useMouseTracker';
import { coordsByDirection } from '~/assets/scripts/garden-planner/classes/gardenGrid';
import { isPropertyAssignment } from 'typescript';


const emit = defineEmits(['update'])

const layoutCreatorGrid = useLayoutCreatorGrid()
const selectedItem = useSelectedItem()
const uiSettings = useUiSettings()
const mouseTracker = useMouseTracker()

const TILE_HIGHLIGHT_STYLE = 'opacity-100 bg-white/80'
const TILE_NO_HIGHLIGHT_STYLE = ''

const props = defineProps({
    coordinates: {
        type: String as PropType<Coordinates>,
        required: true
    }
})

const tileData = computed(() => {
    const version = layoutCreatorGrid.tileVersions.get(props.coordinates)
    const tile = layoutCreatorGrid.grid.getTile(props.coordinates)

    return {
        tile: tile,
        version: version,
        type: tile?.attachedCrop?.crop.type
    }
})

const tileRadiusByPlot = computed(() => {
    const plotLocalCoordinates = tileData.value.tile?.plotLocalCoordinates
        || layoutCreatorGrid.grid.hoveredTilesForPlotPlacing.get(props.coordinates)
        
    const style = ['rounded-none']

    if (!plotLocalCoordinates) return style.join(' ')
    if (!tileData.value.tile && !layoutCreatorGrid.grid.hoveredTilesForPlotPlacing.get(props.coordinates)) return style.join(' ')


    switch (plotLocalCoordinates) {
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
        || layoutCreatorGrid.grid.hoveredTilesForPlotPlacing.get(props.coordinates)
    const style = ['']

    if (!plotLocalCoordinates) {
        style.push('border')
        return style.join(' ')
    }

    const coordsObj = toCoordinateObject(plotLocalCoordinates)

    if (coordsObj.y === 0) style.push('border-t-2')
    if (coordsObj.y === 2) style.push('border-b-2')
    if (coordsObj.x === 0) style.push('border-l-2')
    if (coordsObj.x === 2) style.push('border-r-2')

    return style.join(' ')
})

const showBonusBackground = computed(() => uiSettings.settings.cropTile.showBonusBackground)
const showBonusIcons = computed(() => uiSettings.settings.cropTile.showBonusIcons)

const borderColour = computed(() => {
    const tile = tileData.value.tile
    const crop = tile?.attachedCrop?.crop

    if (!crop || !tile) return 'border-water-retain/80'
    if (tile.hoverState === 'DELETE') return 'border-weed-prevention'
    if (!showBonusBackground.value) return 'border-water-retain/20'

    switch (crop.cropBonus) {
        case Bonus.HarvestIncrease:
            return 'border-harvest-boost-dark dark:border-harvest-boost'
        case Bonus.WaterRetain:
            return 'border-water-retain dark:border-water-retain'
        case Bonus.WeedPrevention:
            return 'border-weed-prevention border-weed-prevention'
        case Bonus.QualityIncrease:
            return 'border-quality-increase-dark dark:border-quality-increase'
        case Bonus.SpeedIncrease:
            return 'border-growth-boost-dark dark:border-growth-boost'
        default:
            return 'border-misc-saturated/80 border-water-retain/80'
    }
})

const isAdjacentTileTheSame = computed(() => {
    const tile = tileData.value.tile

    const tileAdjacencies = {
        north: false,
        east: false,
        west: false,
        south: false
    }

    if (tile) return layoutCreatorGrid.grid.fetchWhichNeighboursAreOfTheSameTypeBoolean(tile?.coordinates, false)

    // for non-tiles, check if they're valid for plot placement
    if (!layoutCreatorGrid.grid.hoveredTilesForPlotPlacing.has(props.coordinates)) return tileAdjacencies

    const northTile = coordsByDirection(props.coordinates, 'North')
    const eastTile = coordsByDirection(props.coordinates, 'East')
    const westTile = coordsByDirection(props.coordinates, 'West')
    const southTile = coordsByDirection(props.coordinates, 'South')

    /**
     * Checks if a tile is also hovered for plot placement
     */
    const isAdjacentTileAlsoHovered = (coordinates: Coordinates) => {
        return layoutCreatorGrid.grid.hoveredTilesForPlotPlacing.has(coordinates)
    }

    return {
        north: isAdjacentTileAlsoHovered(northTile),
        east: isAdjacentTileAlsoHovered(eastTile),
        west: isAdjacentTileAlsoHovered(westTile),
        south: isAdjacentTileAlsoHovered(southTile)
    }
})

const altCropBorder = computed(() => {
    const tile = tileData.value.tile

    const style = ['border-0']

    if (!tile) return style
    if (!isAdjacentTileTheSame.value.north) style.push('border-t')
    // if (!isAdjacentTileTheSame.value.east) style.push('border-r')
    if (!isAdjacentTileTheSame.value.west) style.push('border-l')
    // if (!isAdjacentTileTheSame.value.south) style.push('border-b')

    if (!tile?.attachedCrop) {
        if (isAdjacentTileTheSame.value.east) style.push('border-r')
        if (isAdjacentTileTheSame.value.south) style.push('border-b')
    }

    return style.join(' ')
})

const cropPadding = computed(() => {
    const tile = tileData.value.tile

    const base = ''

    if (!tile && !layoutCreatorGrid.grid.hoveredTilesForPlotPlacing.has(props.coordinates)) {
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
    const tile = tileData.value.tile

    if (!tile) return

    const style: string[] = []
    switch (tile.hoverState) {
        case 'DEFAULT':
            style.push('bg-water-retain/80')
            break;
        case 'NONE':
        default:
            style.push('dark:bg-palia-blue')
    }

    return style.join(' ')
})


const bgColour = computed(() => {
    const tile = tileData.value.tile
    if (!tile && layoutCreatorGrid.grid.hoveredTilesForPlotPlacing.has(props.coordinates)) {
        return (layoutCreatorGrid.grid.plotCanBePlacedInCheckedTile ? 'bg-water-retain' : 'bg-weed-prevention')
    }
    if (!tile) return 'bg-palia-blue'

    if (selectedItem.hoverType === SelectedItemType.Crop && tile.crop) {
        if ((selectedItem.hoverVal as Crop).type === tile.crop.type)
            return 'bg-accent'
    } else if (selectedItem.hoverType === SelectedItemType.Fertiliser && tile.fertiliser) {
        if ((selectedItem.hoverVal as Fertiliser).type === tile.fertiliser.type)
            return 'bg-accent'
    }

    if (tileData.value.tile?.hoverState === 'DELETE' || tileData.value.tile?.hoverState === 'INVALID')
        return 'bg-weed-prevention/60'

    if (!showBonusBackground.value) return 'bg-palia-blue'

    return `${tileData.value.tile?.crop?.cropBackgroundColor}` || ''
})


function handleLeftClick() {
    if (!layoutCreatorGrid.grid.plotCanBePlacedInCheckedTile) return
    layoutCreatorGrid.placePlot(props.coordinates)

    emit('update')
}

function handleRightClick() {
    if (!tileData.value.tile) return

    layoutCreatorGrid.deletePlot(props.coordinates)
    emit('update')
}


function handleDrag() {
    // if (!tileData.value.tile) {
    //     return
    // }

    if (mouseTracker.left && !mouseTracker.right) {
        handleLeftClick()
        emit('update')
    }
    else if (mouseTracker.right && !mouseTracker.left) {
        handleRightClick()
        emit('update')
    }

}

function handleHover() {
    if (tileData.value.tile) {
        return
    }
    layoutCreatorGrid.hoverTile(props.coordinates)
    handleDrag()
}


function handleUnhover() {
    layoutCreatorGrid.unhoverTile()
    // handleDrag()
}

function handleMiddleClick() {
    // const tile = tileData.value.tile

    // if (!tile) return

    // if (tile.crop)
    //     selectedItem.select(tile.crop)
    // else if (tile.fertiliser)
    //     selectedItem.select(tile.fertiliser)
    // else return
}

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
            style.push('-translate-4', 'scale-150')
            break;
        case CropSize.Tree:
            style.push('-translate-8', 'scale-175')
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
        class="w-7 xl:w-8 aspect-square items-center  justify-center  border-water-retain/80 relative select-none"
        :class="[tileBorderWeightByPlot, tileRadiusByPlot]">
        <button
v-if="tileData.tile"
            class="flex items-center justify-center border-0 w-full h-full relative isolate rounded-none cursor-crosshair"
            :class="[backgroundColourByHover, tileRadiusByPlot]" @contextmenu.stop.prevent
            @click.right="handleRightClick">
            <img
v-if="(tileData.tile.crop?.image && tileData.tile.crop?.image.length > 0)" width="48px" height="48px"
                format="webp" draggable="false"
                class="absolute select-none pointer-events-none p-1 -z-10 max-w-7 md:max-w-7 2xl:max-w-8 opacity-40"
                :class="[tileData.tile.hoverState !== 'NONE' ? ' opacity-20' : '', displayImageByCropSize]"
                :src="tileData.tile.crop?.image" :srcset="undefined" :alt="tileData.tile.crop?.type">
            <div class="absolute pointer-events-none -z-20 w-full h-full" :class="[cropPadding]">
                <div class="w-full h-full " :class="[bgColour, borderColour]" />
            </div>

            <span
v-if="tileData.tile.plotLocalCoordinates === '2,0'" aria-label="Delete" class="tooltip"
                data-tip="Delete Plot">
                <button
class="btn btn-ghost btn-square btn-xs btn-warning"
                    @click="layoutCreatorGrid.deletePlot(coordinates)">
                    <font-awesome-icon class="text-xs" icon="trash" />
                </button>
            </span>
        </button>
        <button
v-else
            class="flex items-center justify-center w-full h-full relative isolate rounded-none cursor-pointer"
            :class="[backgroundColourByHover, tileRadiusByPlot]" @mousedown.middle.prevent.stop
            @click.left="handleLeftClick" @click.middle="handleMiddleClick" @contextmenu.stop.prevent
            @mouseenter="handleHover" @mouseleave="handleUnhover">
            <!-- <span>
                {{ layoutCreatorGrid.grid.hoveredTilesForPlotPlacing.get(coordinates) }}
            </span> -->
            <div class="absolute pointer-events-none -z-20 w-full h-full" :class="[cropPadding]">
                <div class="w-full h-full " :class="[bgColour, altCropBorder, tileRadiusByPlot]" />
            </div>
        </button>
    </div>
</template>