<script setup lang="ts">
import Konva from 'konva'
import type Coordinates from 'assets/scripts/utils/types/coordinates'
import { Building, BuildingType, Direction } from 'assets/scripts/house-planner/imports'
import HouseGrid from './HouseGrid.vue'
import { useHousePlanConfig } from '@/stores/useHousePlanConfig'

interface KonvaTransformerNode {
  getNode(): Konva.Transformer
}

const plannerConfig = useHousePlanConfig()
const selectedBuilding = ref<Building | null>(null)
const buildings = ref<Building[]>([])
const stage = ref<Konva.Stage | null>(null)
const transformer = ref<KonvaTransformerNode | null>(null)
const buildingsToTransform = ref<Building[]>([])

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
  width: plannerConfig.CELL_SIZE * 11 * plannerConfig.SIZE_MULTIPLIER,
  height: plannerConfig.CELL_SIZE * 11 * plannerConfig.SIZE_MULTIPLIER,
  imageUrl: '/buildings/harvest-house.svg',
}))

const hallway = ref<Building>(new Building({
  type: BuildingType.Hallway,
  needsParent: true,
  openSlots: {
    [Direction.North]: true,
    [Direction.East]: true,
    [Direction.South]: true,
    [Direction.West]: true,
  },
}, {
  x: 0,
  y: 0,
  width: plannerConfig.CELL_SIZE * 3 * plannerConfig.SIZE_MULTIPLIER,
  height: plannerConfig.CELL_SIZE * 3 * plannerConfig.SIZE_MULTIPLIER,
  imageUrl: '/buildings/hallway.svg',
}))

const mediumHouse = ref<Building>(new Building({
  type: BuildingType.MediumHouse,
  needsParent: true,
  openSlots: {
    [Direction.North]: true,
    [Direction.East]: true,
    [Direction.South]: true,
    [Direction.West]: true,
  },
}, {
  x: 0,
  y: 0,
  width: plannerConfig.CELL_SIZE * 9 * plannerConfig.SIZE_MULTIPLIER,
  height: plannerConfig.CELL_SIZE * 9 * plannerConfig.SIZE_MULTIPLIER,
  imageUrl: '/buildings/medium-house.svg',
}))

const emptyBuilding = ref<Building>(new Building({
  type: BuildingType.None,
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
  width: plannerConfig.width,
  height: plannerConfig.height,
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
  return Math.round(num / plannerConfig.CELL_SIZE) * plannerConfig.CELL_SIZE
}

const previewSquare = ref({
  x: 0,
  y: 0,
  width: plannerConfig.CELL_SIZE,
  height: plannerConfig.CELL_SIZE,
  offsetX: 0,
  offsetY: 0,
  fill: 'transparent',
  opacity: 0.2,
})
const transformSquare = ref({
  x: 0,
  y: 0,
  width: plannerConfig.CELL_SIZE,
  height: plannerConfig.CELL_SIZE,
  offsetX: 0,
  offsetY: 0,
  fill: 'transparent',
  stroke: 'blue',
  strokeWidth: 1,
  opacity: 1,
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

          const hasIntersection = checkIntersection()
          snapToClosestBuilding(mousePos)
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
      const buildingType = selectedBuilding.value?.buildingData.type

      if (buildingType !== BuildingType.None) {
        placeBuilding()
      }
      else {
        const clickedBuilding = checkClicked(stageObj.getPointerPosition() as Coordinates)
        if (clickedBuilding) {
          const children = clickedBuilding.allChildBuildings
          const buildingGroup = [clickedBuilding, ...children]

          // calculate for the x, y, width, height of the group
          const groupRect = buildingGroup.reduce((acc, building) => {
            const rect = (new Konva.Image(building.konvaImage)).getClientRect()
            if (rect.x < acc.x)
              acc.x = rect.x
            if (rect.y < acc.y)
              acc.y = rect.y
            if (rect.x + rect.width > acc.x + acc.width)
              acc.width = rect.x + rect.width - acc.x
            if (rect.y + rect.height > acc.y + acc.height)
              acc.height = rect.y + rect.height - acc.y

            return acc
          }, {
            x: Number.POSITIVE_INFINITY,
            y: Number.POSITIVE_INFINITY,
            width: 0,
            height: 0,
          })

          const offset = plannerConfig.CELL_SIZE * 2
          transformSquare.value.x = groupRect.x - offset
          transformSquare.value.y = groupRect.y - offset
          transformSquare.value.width = groupRect.width + offset * 2
          transformSquare.value.height = groupRect.height + offset * 2
        }
      }
    })
  }
})

function checkClicked(mousePos: Coordinates): Building {
  const clickedBuilding = buildings.value.find((building) => {
    const rect = (new Konva.Image(building.konvaImage)).getClientRect()
    if (
      mousePos.x > rect.x
            && mousePos.x < rect.x + rect.width
            && mousePos.y > rect.y
            && mousePos.y < rect.y + rect.height
    )
      return true

    return false
  })

  return clickedBuilding as Building
}

function setBuilding(building: Building | null) {
  if (building === null) {
    selectedBuilding.value = null
    return
  }
  selectedBuilding.value = new Building(building.buildingData, building.konvaData, building.id)
  selectedBuilding.value.setOpacity(0)
  selectedBuilding.value.resetId()
}

const closestBuilding = ref<Building | null>(null)
const closestSide = ref<Direction | null>(null)

function placeBuilding() {
  if (selectedBuilding.value) {
    if (selectedBuilding.value.buildingData.needsParent && buildingsIntersecting() === 0) {
      buildings.value.push(new Building(selectedBuilding.value.buildingData, selectedBuilding.value.konvaData, selectedBuilding.value.id) as Building)
      closestBuilding.value?.addChild(selectedBuilding.value as Building, closestSide.value as Direction)
    }
    else if (!selectedBuilding.value.buildingData.needsParent) { buildings.value.push(new Building(selectedBuilding.value.buildingData, selectedBuilding.value.konvaData, selectedBuilding.value.id) as Building) }

    if (selectedBuilding.value.buildingData.type === BuildingType.HarvestHouse) {
      setBuilding(emptyBuilding.value as Building)
      resetPreviewSquare()
    }
    selectedBuilding.value.resetId()
  }
}

function resetPreviewSquare() {
  previewSquare.value.x = 0
  previewSquare.value.y = 0
  previewSquare.value.width = plannerConfig.CELL_SIZE
  previewSquare.value.height = plannerConfig.CELL_SIZE
  previewSquare.value.fill = 'transparent'
}

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
      return true
    }
    else {
      previewSquare.value.fill = 'white'
      closestBuilding.value = null
      closestSide.value = null
      return false
    }
  }
}

function buildingsIntersecting(): number {
  if (selectedBuilding.value) {
    const selectedBuildingRect = (new Konva.Image(selectedBuilding.value.konvaImage)).getClientRect()

    const intersection = buildings.value.filter((buildingItem) => {
      const rect = (new Konva.Image(buildingItem.konvaImage)).getClientRect()

      if (
        selectedBuildingRect.x < rect.x + rect.width
                && selectedBuildingRect.x + selectedBuildingRect.width > rect.x
                && selectedBuildingRect.y < rect.y + rect.height
                && selectedBuildingRect.y + selectedBuildingRect.height > rect.y
      )
        return true

      return false
    })

    return intersection.length
  }

  return 0
}
function snapToClosestBuilding({ x, y }: Coordinates) {
  if (!selectedBuilding.value || !closestBuilding.value)
    return

  const selectedCoordinates = { x, y }
  let distanceToClosestBuilding = Number.POSITIVE_INFINITY
  // for each side of the selected building, check if it's close to the closest building
  for (const [side, isOpen] of Object.entries(closestBuilding.value?.buildingData.openSlots as Record<Direction, boolean>)) {
    if (isOpen) {
      const snapCoords = closestBuilding.value?.getSnapCoords(side as Direction) as Coordinates

      const distance = Math.hypot(
        selectedCoordinates.x - snapCoords.x,
        selectedCoordinates.y - snapCoords.y,
      )

      if (distance < distanceToClosestBuilding) {
        closestSide.value = side as Direction
        distanceToClosestBuilding = distance
      }
    }
  }

  if (closestSide.value) {
    selectedBuilding.value.coordinates = closestBuilding.value?.getSnapCoords(closestSide.value) as Coordinates
    selectedBuilding.value.rotateToSnapDirection(closestSide.value, closestBuilding.value as Building)
    selectedBuilding.value.snapToBuilding(closestBuilding.value as Building, closestSide.value)
    previewSquare.value.x = selectedBuilding.value.coordinates.x
    previewSquare.value.y = selectedBuilding.value.coordinates.y
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
      <button class="btn btn-accent" @click="setBuilding(hallway as Building)">
        Hallway
      </button>
      <button class="btn btn-accent" @click="setBuilding(mediumHouse as Building)">
        Medium House
      </button>
    </div>

    {{ buildingsIntersecting() }}

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
        <v-rect :config="transformSquare" />
        <v-transformer ref="transformer" />
      </v-layer>
    </v-stage>
  </section>
</template>
