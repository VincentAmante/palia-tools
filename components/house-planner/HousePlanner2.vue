<script setup lang="ts">
import type Konva from 'konva'
import { BuildingType } from 'assets/scripts/house-planner/enums/building-type'
import HouseGrid from './HouseGrid.vue'
import type { Building } from '@/assets/scripts/house-planner/classes/building'
import type { Direction } from '@/assets/scripts/house-planner/imports'
import { Hallway, HarvestHouse, LargeHouse, MediumHouse, NullHouse, SmallHouse } from '@/assets/scripts/house-planner/imports'

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
  fontFamily: 'Mono',
  fill: 'white',
})

const buildings = ref<Record<string, Building>>(
  {
    [harvestHouse.value.id]: harvestHouse.value as Building,
  },
)

const harvestHouses = computed(() => {
  return Object.values(buildings.value).filter(building => building.type === BuildingType.HarvestHouse) as HarvestHouse[]
})

const countedBuildings = computed(() => {
  return Object.values(buildings.value).filter(building => (building.countsTowardsLimit && building.isPlaced)).length
})

const activeBuilding = ref<Building | null>(harvestHouse.value as Building)
const isEditingBuilding = ref(false)

const parentToSnap = ref<Building | null>(null)
const sideToSnap = ref<Direction | null>(null)

function moveActiveBuilding(x: number, y: number) {
  const snappedX = snapToCellSize(x)
  const snappedY = snapToCellSize(y)
  const building = activeBuilding.value

  if (building)
    building.updateCoords({ x: snappedX, y: snappedY })
}

function showBuildingColliding() {
  if (activeBuilding.value === null)
    return

  activeBuilding.value.opacity = 0.5
  activeBuilding.value.childrenIds.forEach((childId) => {
    const child = buildings.value[childId]
    if (child)
      child.opacity = 0.5
  })
}

function clearBuildingColliding() {
  if (activeBuilding.value === null)
    return

  activeBuilding.value.opacity = 1
  activeBuilding.value.childrenIds.forEach((childId) => {
    const child = buildings.value[childId]
    if (child)
      child.opacity = 1
  })
}

function clearSnapData() {
  parentToSnap.value = null
  sideToSnap.value = null
}

function onMouseMove() {
  const stageObj = stage.value?.getStage() as Konva.Stage

  if (!stageObj)
    return

  const mousePos = stageObj.getPointerPosition()
  if (!mousePos)
    return

  text.value.text = `x: ${mousePos.x}, y: ${mousePos.y}`
  moveActiveBuilding(mousePos.x, mousePos.y)

  if (activeBuilding.value === null)
    return

  let hasCollision: boolean | Building = false
  hasCollision = checkForCollisions(activeBuilding.value as Building, [activeBuilding.value.id, ...activeBuilding.value?.childrenIds])
  activeBuilding.value.childrenIds.forEach((childId) => {
    const child = buildings.value[childId]
    if (child) {
      const isColliding = checkForCollisions(child, [activeBuilding.value?.id || '', ...activeBuilding.value?.childrenIds || []])
      if (isColliding)
        hasCollision = isColliding
    }
  })

  // Handle snapping to other buildings
  if (hasCollision && activeBuilding.value.needsParent) {
    const collidingBuilding = hasCollision as Building
    const snappedX = snapToCellSize(mousePos.x)
    const snappedY = snapToCellSize(mousePos.y)
    const snapData = activeBuilding.value.trySnapToBuilding({
      x: snappedX,
      y: snappedY,
    }, collidingBuilding)

    if (snapData.snapped) {
      sideToSnap.value = snapData.side
      parentToSnap.value = collidingBuilding
      const hasOtherCollisions = checkForCollisions(activeBuilding.value as Building, [...activeBuilding.value?.childrenIds as string[], collidingBuilding.id])
      if (hasOtherCollisions)
        showBuildingColliding()
      else
        clearBuildingColliding()
    }
    else {
      clearSnapData()
      showBuildingColliding()
    }
  }
  else if (hasCollision) {
    showBuildingColliding()
  }
  else {
    clearSnapData()
    clearBuildingColliding()
  }
}

watch((stage), () => {
  if (typeof stage === 'object') {
    const stageObj = stage.value?.getStage() as Konva.Stage

    stageObj.on('mousemove', () => {
      onMouseMove()
    })

    stageObj.on('click', () => {
      if (activeBuilding.value === null)
        return

      if (activeBuilding.value.type === BuildingType.None) {
        const mousePos = stageObj.getPointerPosition()
        const snappedX = snapToCellSize(mousePos?.x as number)
        const snappedY = snapToCellSize(mousePos?.y as number)

        // Object.values(buildings.value).forEach((building) => )
        for (const building of Object.values(buildings.value)) {
          if (building.isPlaced === false)
            return

          const isInside = building.isPointInBuilding({
            x: snappedX,
            y: snappedY,
          })

          if (isInside) {
            setActiveBuilding(building)
            building.isPlaced = false
            building.childrenIds.forEach((childId) => {
              const child = buildings.value[childId]
              if (child)
                child.isPlaced = false
            })
            building.removeParent()
            isEditingBuilding.value = true
          }
        }
      }

      if (!activeBuilding.value.needsParent) {
        placeBuilding()
      }
      else if (parentToSnap.value !== null && sideToSnap.value !== null) {
        const parent = buildings.value[parentToSnap.value.id]
        const side = sideToSnap.value
        const building = activeBuilding.value

        const hasOtherCollisions = checkForCollisions(building as Building, [...building.childrenIds, parent.id])

        if (hasOtherCollisions)
          return

        parent.addChild(building as Building, side)
        placeBuilding([parent.id])
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

      onMouseMove()
    })
  }
})

function placeBuilding(excludeIds: string[] = []) {
  const building = (activeBuilding.value as Building)
  if (!building)
    return

  let hasCollision = checkForCollisions(building, [...new Set([...building.childrenIds, ...excludeIds])])
  building.childrenIds.forEach((childId) => {
    const child = buildings.value[childId]
    if (child) {
      const isColliding = checkForCollisions(child, [activeBuilding.value?.id || '', ...activeBuilding.value?.childrenIds || []])
      if (isColliding)
        hasCollision = isColliding
    }
  })
  if (hasCollision)
    return

  buildings.value[building.id] = building
  building.isPlaced = true

  buildings.value[building.id] = building
  building.childrenIds.forEach((childId) => {
    const child = buildings.value[childId]
    if (child)
      child.isPlaced = true
  })

  if (isEditingBuilding.value) {
    isEditingBuilding.value = false
    setActiveBuilding(new NullHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER }))
  }
  else {
    setActiveBuilding(building.copy)
  }
}

function checkForCollisions(buildingToPlace: Building, excludeIds: string[] = []): Building | false {
  for (const building of Object.values(buildings.value)) {
    if (excludeIds.includes(building.id))
      continue

    const currBuilding = building
    if (currBuilding.id === buildingToPlace.id)
      continue

    const isColliding = buildingToPlace.checkCollision(currBuilding, [...buildingToPlace.childrenIds, ...excludeIds])

    if (isColliding)
      return currBuilding
  }

  return false
}

function findBuildingById(id: string) {
  return buildings.value[id]
}

function setActiveBuilding(building: Building) {
  clearUnplacedBuildings()
  const newBuilding = building
  activeBuilding.value = newBuilding as Building
  buildings.value[newBuilding.id] = newBuilding as Building
}

function clearUnplacedBuildings() {
  for (const buildingId in buildings.value) {
    const currBuilding = buildings.value[buildingId]
    if (currBuilding.isPlaced === false)
      delete buildings.value[buildingId]
  }
}
</script>

<template>
  <section class="px-16">
    <div class="flex gap-2 flex-wrap py-1" />

    <div>
      <p>{{ countedBuildings }} / 30</p>
    </div>

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
        @click="setActiveBuilding(new LargeHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER }))"
      >
        LargeHouse
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
        <template v-for="building in buildings" :key="building.id">
          <template v-for="collisionBox in building.collisionBoxes" :key="collisionBox.id">
            <v-rect :config="collisionBox.rect" />
          </template>
        </template>
      </v-layer>
      <v-layer>
        <v-text :config="text" />
        <template v-for="building in buildings" :key="building.id">
          <v-image :config="building.image" />
          <!-- <v-rect :config="building.snapBox" /> -->
        </template>
        <template v-for="plotHarvestHouse in harvestHouses" :key="plotHarvestHouse.id">
          <v-text :config="plotHarvestHouse.buildingCountText" />
        </template>
      </v-layer>
    </v-stage>

    <div>
      <p>List of building ids</p>
      <ul>
        <li v-for="building in buildings" :key="building.id" class="grid">
          <p>
            {{ building.id }} - {{ building.type }}
          </p>
          <p v-if="building.type === BuildingType.HarvestHouse">
            {{ building.childrenIds }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>
