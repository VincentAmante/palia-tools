import { defineStore, skipHydrate } from 'pinia'
import type { Coordinates, GardenGridPlaceCropOptions } from '~/assets/scripts/garden-planner/classes/gardenGrid';
import { GardenGrid, } from '~/assets/scripts/garden-planner/classes/gardenGrid'
import type { Crop, Fertiliser } from '~/assets/scripts/garden-planner/imports';



// TODO: Remove this after
const DEV_PLOT_GRID_A = () => {
    return {
        widthInTiles: 9,
        heightInTiles: 11,
        startCoords: {
            x: 0,
            y: 0,
        },
        plotCoordinates: new Set<Coordinates>()
            .add(`0,0`).add(`3,0`).add(`6,0`)
            .add(`0,3`).add(`3,3`).add(`6,3`)
            .add(`0,6`).add(`3,6`).add(`6,6`)
    }
}

// offset grid
const DEV_PLOT_GRID_B = () => {
    return {
        widthInTiles: 9,
        heightInTiles: 11,
        startCoords: {
            x: 0,
            y: 0,
        },
        plotCoordinates: new Set<Coordinates>()
            .add(`0,2`).add(`3,1`).add(`6,0`)
            .add(`0,5`).add(`3,4`).add(`6,3`)
            .add(`0,8`).add(`3,7`).add(`6,6`)
    }
}

const DEV_PLOT_GRID_C = () => {
    return {
        widthInTiles: 10,
        heightInTiles: 11,
        startCoords: {
            x: 0,
            y: 0,
        },
        plotCoordinates: new Set<Coordinates>()
            .add(`0,2`).add(`3,1`).add(`6,0`)
            .add(`0,5`).add(`3,4`).add(`7,3`)
            .add(`0,8`).add(`3,7`).add(`6,6`)
    }
}
// ----

const useGardenGrid = defineStore('gardenGrid', () => {
    const grid = shallowRef(new GardenGrid(DEV_PLOT_GRID_A()))

    // Handles individual tile updates
    const tileVersions = ref(new Map<Coordinates, number>())
    function handleModifiedTiles(coordinates: Set<Coordinates>) {
        coordinates.forEach((coordKey) => {
            const currentVersion = tileVersions.value.get(coordKey) || 0
            tileVersions.value.set(coordKey, currentVersion + 1)
        })
    }

    function getTile(coordinates: Coordinates) {
        return grid.value.getTile(coordinates)
    }

    function unhoverTile() {
        const modifiedTiles = grid.value.unhoverTiles()
        handleModifiedTiles(modifiedTiles)
    }
    function hoverTile(coordinates: Coordinates, selectedItem: Crop | Fertiliser | null = null) {
        const modifiedTiles = grid.value.hoverTile(coordinates, selectedItem)
        handleModifiedTiles(modifiedTiles)
    }

    function placeCrop(coordinates: Coordinates, crop: Crop | null, options: GardenGridPlaceCropOptions = {}) {
        const modifiedTiles = grid.value.placeCrop(coordinates, crop, options)
        unhoverTile()
        handleModifiedTiles(modifiedTiles)
    }

    function placeFertiliser(coordinates: Coordinates, fertiliser: Fertiliser | null) {
        const modifiedTiles = grid.value.placeFertiliser(coordinates, fertiliser)
        unhoverTile()
        handleModifiedTiles(modifiedTiles)
    }

    function loadGardenByCode(code: string){
        const newGarden = GardenGrid.loadGardenByCode(code)
        tileVersions.value = new Map<Coordinates, number>()
        grid.value = newGarden
    }

    return {
        grid: skipHydrate(grid),
        tileVersions: skipHydrate(tileVersions),
        handleModifiedTiles,
        placeCrop,
        hoverTile,
        unhoverTile,
        placeFertiliser,
        loadGardenByCode
    }
})

export default useGardenGrid