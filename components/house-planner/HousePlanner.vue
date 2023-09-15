<script setup lang="ts">
import type Konva from 'konva'
import { BuildingType } from 'assets/scripts/house-planner/enums/building-type'
import HouseGrid from './HouseGrid.vue'
import type { Building } from '@/assets/scripts/house-planner/classes/building'
import type { Direction } from '@/assets/scripts/house-planner/imports'
import { Hallway, HarvestHouse, MediumHouse, NullHouse, SmallHouse } from '@/assets/scripts/house-planner/imports'

import { useHousePlanConfig } from '@/stores/useHousePlanConfig'

const houseConfig = useHousePlanConfig()
const harvestHouse = ref(new HarvestHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER }))

function snapToCellSize(num: number) {
  return Math.round(num / houseConfig.CELL_SIZE) * houseConfig.CELL_SIZE
}

const stage = ref<Konva.Stage | null>(null)
const configKonva = ref({
  width: houseConfig.width,
  height: houseConfig.height,
  listening: true,
})

const text = ref({
  x: 10,
  y: 10,
  text: 'Simple Text',
  fontSize: 16,
  fontFamily: 'Calibri',
  fill: 'white',
})

const buildings = ref<Record<string, Building>>(
  {
    [harvestHouse.value.id]: harvestHouse.value as Building,
  },
)

const activeBuilding = ref<Building | null>(harvestHouse.value as Building)
const editingBuilding = ref(false)

const closestBuilding = ref<Building | null>(null)
const sideToSnap = ref<Direction | null>(null)

watch((stage), () => {
  if (typeof stage === 'object') {
    const stageObj = stage.value?.getStage() as Konva.Stage

    stageObj.on('mousemove', () => {
      const mousePos = stageObj.getPointerPosition()
      if (mousePos === null)
        return

      text.value.text = `${mousePos.x}, ${mousePos.y}`

      const snappedX = snapToCellSize(mousePos.x)
      const snappedY = snapToCellSize(mousePos.y)

      if (activeBuilding.value === null)
        return

      if (activeBuilding.value.type === BuildingType.None)
        return

      const building = findBuildingById(activeBuilding.value.id)
      if (building)
        building.updateCoords({ x: snappedX, y: snappedY })

      const extraIds: string[] = (building) ? [...building.childrenIds] : []

      // Check if building is colliding with other buildings
      for (const buildingId in buildings.value) {
        const currBuilding = buildings.value[buildingId]
        if (currBuilding.id === building.id)
          continue

        if (extraIds.includes(currBuilding.id))
          continue

        const isColliding = building.checkCollision(currBuilding, [
          building.id,
          ...extraIds,
        ])

        if (isColliding && mousePos) {
          console.log('colliding')

          const canSnap = building.trySnapToBuilding({
            x: snappedX,
            y: snappedY,
          }, currBuilding)

          if (canSnap && canSnap.side !== null) {
            closestBuilding.value = currBuilding
            sideToSnap.value = canSnap.side
          }
        }
      }
    })

    stageObj.on('click', () => {
      if (activeBuilding.value?.type === BuildingType.None) {
        const mousePos = stageObj.getPointerPosition()

        for (const buildingToCheck in buildings.value) {
          const currBuilding = buildings.value[buildingToCheck]
          if (currBuilding.isPlaced === false)
            continue

          if (mousePos === null)
            return

          const snappedX = snapToCellSize(mousePos.x)
          const snappedY = snapToCellSize(mousePos.y)

          const mouseInBuilding = currBuilding.isPointInBuilding({
            x: snappedX,
            y: snappedY,
          })

          if (mouseInBuilding) {
            if (currBuilding.parent !== null)
              currBuilding.removeParent()

            activeBuilding.value = currBuilding
            editingBuilding.value = true
            currBuilding.isPlaced = false
            return
          }
        }

        return
      }

      const buildingToPlace = (editingBuilding.value) ? (activeBuilding.value as Building) : (activeBuilding.value as Building).copy

      if (sideToSnap.value !== null && closestBuilding.value !== null) {
        const parentBuildingId = closestBuilding.value.id
        const parentBuilding = findBuildingById(parentBuildingId)

        if (closestBuilding.value)
          parentBuilding.addChild(buildingToPlace as Building, sideToSnap.value)
      }

      buildingToPlace.isPlaced = true
      buildings.value[buildingToPlace.id] = (buildingToPlace as Building)

      if (editingBuilding.value) {
        editingBuilding.value = false
        setActiveBuilding(new NullHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER }))
      }
    })

    window.addEventListener('keydown', (e) => {
      if (activeBuilding.value === null)
        return

      const building = findBuildingById(activeBuilding.value.id)

      // convert above to switch statement
      switch (e.code) {
        case 'KeyQ':
          building.rotateBuilding(-90)
          break
        case 'KeyE':
          building.rotateBuilding(90)
          break

        case 'KeyW':
          building.updateCoords({ x: building.x, y: building.y - houseConfig.CELL_SIZE })
          break
        case 'KeyS':
          building.updateCoords({ x: building.x, y: building.y + houseConfig.CELL_SIZE })
          break
        case 'KeyA':
          building.updateCoords({ x: building.x - houseConfig.CELL_SIZE, y: building.y })
          break
        case 'KeyD':
          building.updateCoords({ x: building.x + houseConfig.CELL_SIZE, y: building.y })
          break
        default:
          break
      }
    })
  }
})

function findBuildingById(id: string) {
  return buildings.value[id]
}

function setActiveBuilding(building: Building) {
  // remove unplaced buildings
  for (const buildingId in buildings.value) {
    const currBuilding = buildings.value[buildingId]
    if (building && currBuilding.id === building.id)
      continue

    if (currBuilding.isPlaced === false)
      delete buildings.value[buildingId]
  }

  const newBuilding = building.copy
  buildings.value[newBuilding.id] = newBuilding as Building
  activeBuilding.value = newBuilding as Building
}
</script>

<template>
  <section class="px-16">
    <div class="flex gap-2 flex-wrap py-1" />

    <div class="flex gap-2 py-4">
      <button
        class="btn btn-accent"
        @click="setActiveBuilding(new HarvestHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER }))"
      >
        Harvest House
      </button>
      <button
        class="btn btn-accent"
        @click="setActiveBuilding(new Hallway({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER }))"
      >
        Hallway
      </button>
      <button
        class="btn btn-accent"
        @click="setActiveBuilding(new MediumHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER }))"
      >
        Medium House
      </button>
      <button
        class="btn btn-accent"
        @click="setActiveBuilding(new SmallHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER }))"
      >
        Small House
      </button>
      <button
        class="btn btn-accent"
        @click="setActiveBuilding(new NullHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER }))"
      >
        None
      </button>
    </div>

    <v-stage ref="stage" :config="configKonva">
      <HouseGrid />
      <v-layer>
        <v-text :config="text" />
        <template v-for="building in buildings" :key="building.id">
          <v-image :config="building.image" />
          <v-rect :config="building.snapBox" />
        </template>
      </v-layer>
    </v-stage>

    <div>
      <p>List of building ids</p>
      <ul>
        <li v-for="building in buildings" :key="building.id">
          {{ building.id }}
        </li>
      </ul>
    </div>
  </section>
</template>
