<script setup lang="ts">
import Konva from 'konva'
import { BuildingType } from 'assets/scripts/house-planner/enums/buildingType'
import HouseGrid from './HouseGrid.vue'
import BuildingButton from './BuildingButton.vue'
import type { Building } from '@/assets/scripts/house-planner/classes/building'
import type { Direction } from '@/assets/scripts/house-planner/imports'
import { Fireplace, Hallway, HarvestHouse, KilimaDoor, KilimaPorch, LargeHouse, MediumHouse, NullHouse, SmallHouse } from '@/assets/scripts/house-planner/imports'

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

const buildingsLayer = ref<Konva.Layer | null>(null)

const buildings = ref<Record<string, Building>>(
  {
    [harvestHouse.value.id]: (harvestHouse.value as HarvestHouse),
  },
)

const harvestHouses = computed(() => {
  return Object.values(buildings.value).filter(building => building.type === BuildingType.HarvestHouse) as HarvestHouse[]
})

const countedBuildings = computed(() => {
  return Object.values(buildings.value).filter(building => (building.countsTowardsLimit && building.isPlaced)).length
})

const totalPrice = computed(() => {
  const buildingTypes: Record<BuildingType | string, {
    count: number
    price: number
  }> = {
    [BuildingType.None]: {
      count: 0,
      price: 0,
    },
  }

  Object.values(buildings.value).forEach((building) => {
    if (!building.isPlaced)
      return

    if (building.type in buildingTypes) {
      const price = building.price
      buildingTypes[building.type].count += 1
      buildingTypes[building.type].price += price.base + (price.perExtraBuilding * (buildingTypes[building.type].count - 1))
    }
    else {
      buildingTypes[building.type] = {
        count: 1,
        price: building.price.base,
      }
    }
  })

  return Object.values(buildingTypes).reduce((acc, curr) => {
    return acc + curr.price
  }, 0)
})

const totalMaterials = computed(() => {
  let sapwoodPlanks = 0
  let stoneBricks = 0

  Object.values(buildings.value).forEach((building) => {
    if (!building.isPlaced)
      return

    sapwoodPlanks += building.materials.sapwoodPlanks
    stoneBricks += building.materials.stoneBricks
  })

  return {
    sapwoodPlanks,
    stoneBricks,
  }
})

const activeBuilding = ref<Building | null>(harvestHouse.value as HarvestHouse)
const isEditingBuilding = ref(false)

const parentToSnap = ref<Building | null>(null)
const sideToSnap = ref<Direction | null>(null)

const useBuildingLimits = ref(true)
const showRoofCollisions = ref(true)
const showLabels = ref(false)

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

  const mousePos = stageObj.getRelativePointerPosition()
  if (!mousePos)
    return

  text.value.text = `x: ${mousePos.x}, y: ${mousePos.y}`
  moveActiveBuilding(mousePos.x, mousePos.y)

  if (activeBuilding.value === null)
    return

  let hasCollision: boolean | Building = false

  const excludeIds = [...new Set([...activeBuilding.value.childrenIds, activeBuilding.value.id])]
  hasCollision = checkForCollisions(activeBuilding.value as Building, excludeIds)

  activeBuilding.value.childrenIds.forEach((childId) => {
    const child = buildings.value[childId]
    if (child) {
      const isColliding = checkForCollisions(child, [...excludeIds])
      if (isColliding)
        hasCollision = isColliding
    }
  })

  // Handle snapping to other buildings
  if (hasCollision
    && activeBuilding.value.needsParent
    && hasCollision.id !== activeBuilding.value.id // Prevents snapping to itself
  ) {
    const collidingBuilding = hasCollision as Building
    const snappedX = snapToCellSize(mousePos.x)
    const snappedY = snapToCellSize(mousePos.y)
    const snapData = activeBuilding.value.trySnapToBuilding({
      x: snappedX,
      y: snappedY,
    }, collidingBuilding)

    const topLevelBuilding = collidingBuilding.topLevelBuilding
    const hasSpace = (!useBuildingLimits.value
      || (topLevelBuilding.countableBuildings < houseConfig.MAX_CLUSTER_BUILDINGS && countedBuildings.value < houseConfig.MAX_BUILDINGS)
      || !activeBuilding.value.countsTowardsLimit)

    if (snapData.snapped && hasSpace) {
      sideToSnap.value = snapData.side
      parentToSnap.value = collidingBuilding
      let hasOtherCollisions = checkForCollisions(activeBuilding.value as Building, [...excludeIds, collidingBuilding.id, ...collidingBuilding.directChildrenIds])

      if (activeBuilding.value.childrenIds) {
        activeBuilding.value.childrenIds.forEach((childId) => {
          const child = buildings.value[childId]
          if (child) {
            const isColliding = checkForCollisions(child, [...excludeIds, collidingBuilding.id, ...collidingBuilding.directChildrenIds])
            if (isColliding)
              hasOtherCollisions = isColliding
          }
        })
      }

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
  else if (hasCollision
    || (countedBuildings.value >= houseConfig.MAX_BUILDINGS && useBuildingLimits.value)) {
    showBuildingColliding()
  }
  else {
    clearSnapData()
    clearBuildingColliding()
  }
}

type DebouncedFunction<T extends (...args: any[]) => void> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => void

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate = false,
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this

    const later = function () {
      timeout = null
      if (!immediate)
        func.apply(context, args)
    }
    const callNow = immediate && !timeout

    clearTimeout(timeout as ReturnType<typeof setTimeout>)
    timeout = setTimeout(later, wait)

    if (callNow)
      func.apply(context, args)
  }
}

function tryPlaceBuilding() {
  if (activeBuilding.value === null)
    return

  if (!activeBuilding.value.needsParent) {
    if (!useBuildingLimits.value
          || (countedBuildings.value < houseConfig.MAX_BUILDINGS)
          || !activeBuilding.value.countsTowardsLimit)
      placeBuilding()
  }
  else if (parentToSnap.value !== null && sideToSnap.value !== null) {
    const parent = buildings.value[parentToSnap.value.id]
    const side = sideToSnap.value
    const building = activeBuilding.value

    const excludeIds = [...building.childrenIds, parent.id, ...parent.directChildrenIds, ...building.directChildrenIds]
    const hasOtherCollisions = checkForCollisions(building as Building, excludeIds)

    if (hasOtherCollisions)
      return

    const topLevelBuilding = parent.topLevelBuilding

    if (
      !useBuildingLimits.value
          || (topLevelBuilding.countableBuildings < houseConfig.MAX_CLUSTER_BUILDINGS && countedBuildings.value < houseConfig.MAX_BUILDINGS)
          || !building.countsTowardsLimit) {
      if (placeBuilding(excludeIds))
        parent.addChild(building as Building, side)
    }
  }
}

watch((stage), () => {
  if (typeof stage === 'object') {
    const stageObj = stage.value?.getStage() as Konva.Stage

    stageObj.on('mousemove', () => {
      debounce(onMouseMove, 25)()
    })

    stageObj.on('contextmenu', (e) => {
      e.evt.preventDefault()
    })

    stageObj.on('click', (e) => {
      if (activeBuilding.value === null)
        return

      if (e.evt.button === 2) {
        setActiveBuilding(new NullHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER }))
        return
      }

      if (activeBuilding.value.type === BuildingType.None) {
        const mousePos = stageObj.getRelativePointerPosition()
        const snappedX = snapToCellSize(mousePos?.x as number)
        const snappedY = snapToCellSize(mousePos?.y as number)

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

      tryPlaceBuilding()
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
        default:
          break
      }

      onMouseMove()
    })
  }
})

function placeBuilding(excludeIds: string[] = []): boolean {
  const building = (activeBuilding.value as Building)
  if (!building)
    return false

  const excludeList = [...new Set([...building.childrenIds, ...excludeIds, building.id])]
  let hasCollision = checkForCollisions(building, [...excludeList])
  building.childrenIds.forEach((childId) => {
    const child = buildings.value[childId]
    if (child) {
      const isColliding = checkForCollisions(child, [...excludeList, building.id, child.id])
      if (isColliding)
        hasCollision = isColliding
    }
  })
  if (hasCollision)
    return false

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

  return true
}

function checkForCollisions(buildingToPlace: Building, excludeIds: string[] = []): Building | false {
  if (buildingToPlace.type === BuildingType.None)
    return false

  for (const building of Object.values(buildings.value)) {
    if (building.type === BuildingType.None)
      continue
    if (excludeIds.includes(building.id))
      continue
    const currBuilding = building
    if (currBuilding.id === buildingToPlace.id)
      continue

    const isColliding = buildingToPlace.checkCollision(currBuilding, [...buildingToPlace.childrenIds, ...excludeIds])

    if (isColliding)
      return currBuilding
  }

  if (buildingToPlace.isOutsideGrid(configKonva.value.width, configKonva.value.height))
    return buildingToPlace

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

  activeBuilding.value.removeParent()
}

function clearUnplacedBuildings() {
  for (const buildingId in buildings.value) {
    const currBuilding = buildings.value[buildingId]
    if (currBuilding.isPlaced === false)
      delete buildings.value[buildingId]
  }
}

function createNewBuilding(type: BuildingType) {
  switch (type) {
    case BuildingType.HarvestHouse:
      return new HarvestHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER })
    case BuildingType.Hallway:
      return new Hallway({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER })
    case BuildingType.LargeHouse:
      return new LargeHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER })
    case BuildingType.MediumHouse:
      return new MediumHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER })
    case BuildingType.SmallHouse:
      return new SmallHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER })
    case BuildingType.Fireplace:
      return new Fireplace({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER })
    case BuildingType.None:
      return new NullHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER })
    case BuildingType.KilimaPorch:
      return new KilimaPorch({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER })
    case BuildingType.KilimaDoor:
      return new KilimaDoor({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER })
    default:
      return new NullHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER })
  }
}

const stageContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  Konva.pixelRatio = 1
  window.addEventListener('resize', fitStageIntoParentContainer)

  fitStageIntoParentContainer()
})

function fitStageIntoParentContainer() {
  const container = stageContainer.value as HTMLElement
  const stageObj = (stage.value?.getStage() as Konva.Stage)
  // now we need to fit stage into parent container
  const containerWidth = container.offsetWidth

  // but we also make the full scene visible
  // so we need to scale all objects on canvas
  const scale = containerWidth / houseConfig.width

  stageObj.width(houseConfig.width * scale)
  stageObj.height(houseConfig.height * scale)
  stageObj.scale({ x: scale, y: scale })
}
</script>

<template>
  <div class="flex flex-col gap-2 lg:flex-row justify-evenly">
    <div class="flex flex-wrap gap-1 lg:flex-col">
      <button
        aria-label="clear"
        class="relative text-sm isolate btn"
        :class="(activeBuilding && activeBuilding.type) === BuildingType.None ? 'btn-active' : ''"
        @click="setActiveBuilding(createNewBuilding(BuildingType.None))"
      >
        <font-awesome-icon :icon="['fas', 'hand']" class="text-xl" />
        <p class="font-normal normal-case">
          Cursor
        </p>
      </button>
      <BuildingButton
        src="/buildings/icons/harvest-house.webp"
        label="Harvest House"
        :is-active="(activeBuilding && activeBuilding.type) === BuildingType.HarvestHouse"
        @click="setActiveBuilding(createNewBuilding(BuildingType.HarvestHouse))"
      />
      <BuildingButton
        src="/buildings/icons/large-room.webp"
        label="Large Room"
        :is-active="(activeBuilding && activeBuilding.type) === BuildingType.LargeHouse"
        @click="setActiveBuilding(createNewBuilding(BuildingType.LargeHouse))"
      />
      <BuildingButton
        src="/buildings/icons/medium-room.webp"
        label="Medium Room"
        :is-active="(activeBuilding && activeBuilding.type) === BuildingType.MediumHouse"
        @click="setActiveBuilding(createNewBuilding(BuildingType.MediumHouse))"
      />
      <BuildingButton
        src="/buildings/icons/small-room.webp"
        label="Small Room"
        :is-active="(activeBuilding && activeBuilding.type) === BuildingType.SmallHouse"
        @click="setActiveBuilding(createNewBuilding(BuildingType.SmallHouse))"
      />
      <BuildingButton
        src="/buildings/icons/hallway.webp"
        label="Hallway"
        :is-active="(activeBuilding && activeBuilding.type) === BuildingType.Hallway"
        @click="setActiveBuilding(createNewBuilding(BuildingType.Hallway))"
      />
      <BuildingButton
        src="/buildings/icons/fireplace.webp"
        label="Fireplace"
        :is-active="(activeBuilding && activeBuilding.type) === BuildingType.Fireplace"
        @click="setActiveBuilding(createNewBuilding(BuildingType.Fireplace))"
      />
      <BuildingButton
        src="/buildings/icons/kilima-porch.webp"
        label="Kilima Porch"
        :is-active="(activeBuilding && activeBuilding.type) === BuildingType.KilimaPorch"
        @click="setActiveBuilding(createNewBuilding(BuildingType.KilimaPorch))"
      />
      <BuildingButton
        src="/buildings/icons/kilima-door.webp"
        label="Kilima Door"
        :is-active="(activeBuilding && activeBuilding.type) === BuildingType.KilimaDoor"
        @click="setActiveBuilding(createNewBuilding(BuildingType.KilimaDoor))"
      />
    </div>
    <section
      ref="stageContainer"
      class="max-w-full relative isolate overflow-hidden rounded-md outline outline-2 outline-primary aspect-[877.5/487.5]"
    >
      <DevOnly>
        <p class="absolute left-0 z-50 m-4 text-xs">
          {{ text.text }}
        </p>
      </DevOnly>
      <p class="absolute right-0 z-30 p-2 px-4 m-4 bg-opacity-50 rounded-full bg-palia-blue text-accent">
        {{ countedBuildings }} / 30
      </p>
      <v-stage ref="stage" class="relative isolate" :config="configKonva">
        <HouseGrid />
        <v-layer
          :config="{
            listening: false,
          }"
        >
          <template v-for="building in buildings" :key="building.id">
            <template v-if="showRoofCollisions && (building.type !== BuildingType.None)">
              <template v-for="collisionBox in building.collisionBoxes" :key="collisionBox.id">
                <v-rect v-if="!collisionBox.hide" :config="collisionBox.rect" />
              </template>
            </template>
          </template>
        </v-layer>
        <v-layer
          ref="buildingsLayer"
          :config="{
            listening: false,
          }"
        >
          <template v-for="building in buildings" :key="building.id">
            <v-image :config="building.image" />
            <!-- <v-image :config="building.snapBox" /> -->
          </template>
          <template v-for="plotHarvestHouse in harvestHouses" :key="plotHarvestHouse.id">
            <!-- <v-text :config="plotHarvestHouse.buildingCountText" /> -->
            <v-label :config="plotHarvestHouse.buildingCountText">
              <v-tag :config="plotHarvestHouse.buildingCountText.getTag()" />
              <v-text :config="plotHarvestHouse.buildingCountText.getText()" />
            </v-label>
          </template>
          <template v-if="showLabels">
            <template v-for="building in buildings" :key="building.id">
              <template v-if="building.type !== BuildingType.None">
                <v-label :config="building.nameText">
                  <v-tag :config="building.nameText.getTag()" />
                  <v-text :config="building.nameText.getText()" />
                </v-label>
              </template>
            </template>
          </template>
        </v-layer>
      </v-stage>
    </section>

    <section class="flex flex-col gap-2">
      <div class="flex gap-2 p-4 px-8 rounded-md lg:flex-col bg-palia-dark-blue h-fit">
        <h2 class="text-xl font-bold text-center">
          Costs
        </h2>
        <ul class="flex gap-4 lg:grid">
          <li class="flex items-center gap-2 text-lg">
            <nuxt-img
              width="16" height="16" src="/gold.webp" class="max-h-[1.5rem]" :srcset="undefined" placeholder
              alt="Gold" format="webp"
            />
            {{ totalPrice.toLocaleString() }}
          </li>
          <li class="flex items-center gap-2 text-lg">
            <nuxt-img
              width="32" height="32" src="/items/sapwood-plank.png" class="max-h-[3rem] aspect-auto object-contain"
              :srcset="undefined" placeholder alt="Gold" format="webp"
            />
            {{ totalMaterials.sapwoodPlanks.toLocaleString() }}
          </li>
          <li class="flex items-center gap-2 text-lg">
            <nuxt-img
              width="32" height="32" src="/items/stone-brick.png" class="max-h-[3rem] aspect-auto object-contain"
              :srcset="undefined" placeholder alt="Gold" format="webp"
            />
            {{ totalMaterials.stoneBricks.toLocaleString() }}
          </li>
        </ul>
      </div>
      <div class="flex gap-2 p-4 px-8 text-xs rounded-md bg-palia-dark-blue h-fit">
        <ul class="flex gap-4 lg:grid">
          <li>
            <input v-model="useBuildingLimits" type="checkbox" class="rounded-lg toggle">
            <p>Use Build Limits</p>
          </li>
          <li>
            <input v-model="showRoofCollisions" type="checkbox" class="rounded-lg toggle">
            <p>Show Roof</p>
          </li>
          <li>
            <input v-model="showLabels" type="checkbox" class="rounded-lg toggle">
            <p>Show Labels</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- <DevOnly>
      <div class="p-4 mb-4 font-mono rounded-md  bg-neutral">
        <p class="text-lg font-bold uppercase">
          building ids
        </p>
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
    </DevOnly> -->
  </div>
</template>
