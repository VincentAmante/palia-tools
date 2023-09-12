<script setup lang="ts">
import Konva from 'konva'
import { Building, BuildingType, Direction } from 'assets/scripts/house-planner/imports'
import HouseGrid from './HouseGrid.vue'
import { useHousePlanConfig } from '@/stores/useHousePlanConfig'

const housePlot = useHousePlanConfig()
const selectedBuilding = ref<Building | null>(null)
const buildings = ref<Building[]>([])
const stage = ref<Konva.Stage | null>(null)

const harvestHouse = ref<Building>(new Building({
  type: BuildingType.HarvestHouse,
  needsParent: false,
  openSlots: {
    [Direction.North]: true,
    [Direction.East]: true,
    [Direction.South]: false,
    [Direction.West]: true,
  },
}, {
  x: 0,
  y: 0,
  width: housePlot.CELL_SIZE * 11,
  height: housePlot.CELL_SIZE * 11,
  imageUrl: '/buildings/harvest-house.svg',
}))

const emptyBuilding = ref<Building>(new Building({
  type: BuildingType.HarvestHouse,
  needsParent: false,
  openSlots: {
    [Direction.North]: true,
    [Direction.East]: true,
    [Direction.South]: true,
    [Direction.West]: true,
  },
}, {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  imageUrl: '',
}))

const configKonva = ref({
  width: housePlot.width,
  height: housePlot.height,
  listening: true,
})

const text = ref({
  x: 10,
  y: 10,
  text: 'Hello!',
  fontSize: 12,
  fontFamily: 'Calibri',
  fill: 'white',
})

function snapToCellSize(num: number) {
  return Math.round(num / housePlot.CELL_SIZE) * housePlot.CELL_SIZE
}

const previewSquare = ref({
  x: 0,
  y: 0,
  width: housePlot.CELL_SIZE,
  height: housePlot.CELL_SIZE,
  offsetX: 0,
  offsetY: 0,
  fill: 'transparent',
  opacity: 0.2,
})

watch((stage), () => {
  if (typeof stage === 'object') {
    const stageObj = stage.value?.getStage() as Konva.Stage

    stageObj.on('mouseenter', () => {
      if (selectedBuilding.value) {
        previewSquare.value.fill = 'white'
        selectedBuilding.value.setOpacity(0.5)
      }
    })

    stageObj.on('mouseleave', () => {
      previewSquare.value.fill = 'transparent'
      if (selectedBuilding.value)
        selectedBuilding.value.setOpacity(0)
    })

    stageObj.on('mousemove', () => {
      const mousePos = stageObj.getPointerPosition()
      if (mousePos) {
        text.value.text = `x: ${mousePos.x}, y: ${mousePos.y}`

        if (selectedBuilding.value) {
          selectedBuilding.value.coordinates = {
            x: snapToCellSize(mousePos.x),
            y: snapToCellSize(mousePos.y),
          }

          previewSquare.value.x = selectedBuilding.value.coordinates.x
          previewSquare.value.y = selectedBuilding.value.coordinates.y
          previewSquare.value.offsetX = selectedBuilding.value.konvaData.offsetX
          previewSquare.value.offsetY = selectedBuilding.value.konvaData.offsetY
          previewSquare.value.width = selectedBuilding.value.konvaData.width
          previewSquare.value.height = selectedBuilding.value.konvaData.height

          checkIntersection()
        }
      }
    })

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyQ') {
        if (selectedBuilding.value)
          selectedBuilding.value.rotateBuilding(-90)
      }
      else if (e.code === 'KeyE') {
        if (selectedBuilding.value)
          selectedBuilding.value.rotateBuilding(90)
      }
    })

    stageObj.on('click', () => {
      placeBuilding()
    })
  }
})

function setBuilding(building: Building | null) {
  if (building === null) {
    selectedBuilding.value = null
    return
  }
  selectedBuilding.value = new Building(building.buildingData, building.konvaData, building.id)
  selectedBuilding.value.setOpacity(0)
}

function placeBuilding() {
  const hasIntersection = checkIntersection()
  if (selectedBuilding.value && !hasIntersection) {
    buildings.value.push(new Building(selectedBuilding.value.buildingData, selectedBuilding.value.konvaData, selectedBuilding.value.id) as Building)

    if (selectedBuilding.value.buildingData.type === BuildingType.HarvestHouse) {
      setBuilding(emptyBuilding.value as Building)
      resetPreviewSquare()
    }
  }
}

function resetPreviewSquare() {
  previewSquare.value.x = 0
  previewSquare.value.y = 0
  previewSquare.value.width = housePlot.CELL_SIZE
  previewSquare.value.height = housePlot.CELL_SIZE
  previewSquare.value.fill = 'transparent'
}

const closestBuilding = ref<Building | null>(null)

function checkIntersection() {
  if (selectedBuilding.value) {
    const selectedBuildingRect = (new Konva.Image(selectedBuilding.value.konvaImage)).getClientRect()

    const intersection = buildings.value.find((buildingItem) => {
      const rect = (new Konva.Image(buildingItem.konvaImage)).getClientRect()

      if (
        selectedBuildingRect.x < rect.x + rect.width
                && selectedBuildingRect.x + selectedBuildingRect.width > rect.x
                && selectedBuildingRect.y < rect.y + rect.height
                && selectedBuildingRect.y + selectedBuildingRect.height > rect.y
      ) {
        closestBuilding.value = buildingItem
        return true
      }

      return false
    })

    if (intersection) {
      previewSquare.value.fill = 'red'
      return true
    }
    else {
      previewSquare.value.fill = 'white'
      closestBuilding.value = null
      return false
    }
  }
}
</script>

<template>
  <section class="px-16">
    <div class="flex gap-2 flex-wrap py-1">
      <button class="btn btn-accent" @click="setBuilding(emptyBuilding as Building)">
        Clear Selected
      </button>
      <button class="btn btn-accent" @click="setBuilding(harvestHouse as Building)">
        Harvest House
      </button>
    </div>

    <p>
      {{ selectedBuilding?.boundingBox }}
    </p>
    <p>
      {{ selectedBuilding?.konvaImage }}
    </p>
    <p>
      {{ selectedBuilding?.konvaData }}
    </p>

    <v-stage ref="stage" :config="configKonva">
      <HouseGrid />

      <v-layer>
        <v-text :config="text" />
      </v-layer>
      <v-layer>
        <template v-for="building in buildings" :key="building.id">
          <v-image :config="building.konvaImage" />
        </template>
        <v-rect :config="selectedBuilding?.boundingBox" />
        <v-image :config="selectedBuilding?.konvaImage" />
        <v-rect :config="previewSquare" />
      </v-layer>
    </v-stage>
  </section>
</template>
