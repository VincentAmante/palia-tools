import { defineStore, skipHydrate } from 'pinia'
import { GardenGrid, } from '~/assets/scripts/garden-planner/classes/gardenGrid'
import type { Crop, Fertiliser, Bonus } from '~/assets/scripts/garden-planner/imports';
import type { Coordinates } from '~/assets/scripts/garden-planner/utils/garden-helpers';

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

const useLayoutCreatorGrid = defineStore('layoutCreatorGrid', () => {
    const grid = shallowRef(new GardenGrid(DEV_PLOT_GRID_A()))
    const hoveredBonus = ref<Bonus | null>(null)

    // Handles individual tile updates
    const tileVersions = ref(new Map<Coordinates, number>())
    function handleModifiedTiles(coordinates: Set<Coordinates>) {
        coordinates.forEach((coordKey) => {
            const currentVersion = tileVersions.value.get(coordKey) || 0
            tileVersions.value.set(coordKey, currentVersion + 1)
        })
    }

    function setGarden(code: string){
        grid.value = GardenGrid.loadGardenByCode(code)
        triggerRef(grid)
    }

    function unhoverTile() {
        const modifiedTiles = grid.value.unhoverTilesForPlotPlacing()
        handleModifiedTiles(modifiedTiles)
    }
    function hoverTile(coordinates: Coordinates) {
        const modifiedTiles = grid.value.hoverTileForPlotPlacing(coordinates)
        handleModifiedTiles(modifiedTiles)
    }

    function placePlot(coordinates: Coordinates){
        const modifiedTiles = grid.value.placePlot(coordinates)
        handleModifiedTiles(modifiedTiles)
    }


    function loadGardenByCode(code: string) {
        const newGarden = GardenGrid.loadGardenByCode(code)
        tileVersions.value = new Map<Coordinates, number>()
        grid.value = newGarden

        return true
    }

    function trimGarden() {
        const modifiedTiles = grid.value.trimGarden()
        handleModifiedTiles(modifiedTiles)
        triggerRef(grid)
    }

    function deletePlot(coordinates: Coordinates){
        const modifiedTiles = grid.value.deletePlot(coordinates)
        handleModifiedTiles(modifiedTiles)
        triggerRef(grid)
    }

    function clearTiles(){
        handleModifiedTiles(grid.value.clearTiles())
    }

    function saveGarden(settingsCode?: string){
        const saveString = grid.value.saveGarden(settingsCode)

        return saveString
    }

    return {
        grid: skipHydrate(grid),
        tileVersions: skipHydrate(tileVersions),
        handleModifiedTiles,
        hoverTile,
        unhoverTile,
        loadGardenByCode,
        trimGarden,
        clearTiles,
        saveGarden,
        setGarden,
        deletePlot,
        placePlot
    }
})

export default useLayoutCreatorGrid