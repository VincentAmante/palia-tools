<script setup lang="ts">
import Konva from 'konva'
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
      const hasOtherCollisions = checkForCollisions(activeBuilding.value as Building, [...excludeIds, collidingBuilding.id, ...collidingBuilding.adjacentBuildingIds])
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

// Debounce the mousemove event to prevent lag
// function debounce(func, interval) {
//   let lastCall = -1
//   return function () {
//     clearTimeout(lastCall)
//     const args = arguments
//     const self = this
//     lastCall = setTimeout(() => {
//       func.apply(self, args)
//     }, interval)
//   }
// }

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

watch((stage), () => {
  if (typeof stage === 'object') {
    const stageObj = stage.value?.getStage() as Konva.Stage

    stageObj.cache()

    stageObj.on('mousemove', () => {
      debounce(onMouseMove, 25)()
    })

    stageObj.on('click', () => {
      if (activeBuilding.value === null)
        return

      if (activeBuilding.value.type === BuildingType.None) {
        const mousePos = stageObj.getPointerPosition()
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

        const excludeIds = [...building.childrenIds, parent.id, ...parent.adjacentBuildingIds, ...building.adjacentBuildingIds]
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

function placeBuilding(excludeIds: string[] = []): boolean {
  const building = (activeBuilding.value as Building)
  if (!building)
    return false

  const excludeList = [...new Set([...building.childrenIds, ...excludeIds, building.id])]
  let hasCollision = checkForCollisions(building, [...excludeList, ...building.adjacentBuildingIds])
  building.childrenIds.forEach((childId) => {
    const child = buildings.value[childId]
    if (child) {
      const isColliding = checkForCollisions(child, [...excludeList, ...child.adjacentBuildingIds])
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

    console.log('running collision check', buildingToPlace.id)

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
    case BuildingType.None:
      return new NullHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER })
    default:
      return new NullHouse({ cellSize: houseConfig.CELL_SIZE, sizeMultiplier: houseConfig.SIZE_MULTIPLIER })
  }
}

const stageContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  Konva.pixelRatio = 1
  // window.addEventListener('resize', fitStageIntoParentContainer)

  // fitStageIntoParentContainer()
})

// function fitStageIntoParentContainer() {
//   const container = stageContainer.value as HTMLElement
//   const stageObj = (stage.value?.getStage() as Konva.Stage)
//   // now we need to fit stage into parent container
//   const containerWidth = container.offsetWidth

//   // but we also make the full scene visible
//   // so we need to scale all objects on canvas
//   const scale = containerWidth / houseConfig.width

//   stageObj.width(houseConfig.width * scale)
//   stageObj.height(houseConfig.height * scale)
//   stageObj.scale({ x: scale, y: scale })
// }
</script>

<template>
  <section class=" flex flex-col gap-2 p-4">
    <div class="flex gap-2 py-2 flex-wrap">
      <button class="btn btn-accent" @click="setActiveBuilding(createNewBuilding(BuildingType.HarvestHouse))">
        Harvest House
      </button>
      <button class="btn btn-accent" @click="setActiveBuilding(createNewBuilding(BuildingType.Hallway))">
        Hallway
      </button>
      <button class="btn btn-accent" @click="setActiveBuilding(createNewBuilding(BuildingType.LargeHouse))">
        Large Room
      </button>
      <button class="btn btn-accent" @click="setActiveBuilding(createNewBuilding(BuildingType.MediumHouse))">
        Medium Room
      </button>
      <button class="btn btn-accent" @click="setActiveBuilding(createNewBuilding(BuildingType.SmallHouse))">
        Small Room
      </button>
      <button class="btn btn-accent" @click="setActiveBuilding(createNewBuilding(BuildingType.None))">
        None
      </button>
    </div>

    <section ref="stageContainer" class="w-fit relative aspect-auto isolate overflow-hidden rounded-md outline outline-2 outline-primary">
      <DevOnly>
        <p class="absolute left-0 z-50 m-4 text-xs">
          {{ text.text }}
        </p>
      </DevOnly>
      <p class="absolute right-0 z-30 m-4 bg-palia-blue p-2 text-accent rounded-full px-4 bg-opacity-50">
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
          :config="{
            listening: false,
          }"
        >
          <template v-for="building in buildings" :key="building.id">
            <v-image :config="building.image" />
          </template>
          <template v-for="plotHarvestHouse in harvestHouses" :key="plotHarvestHouse.id">
            <v-text :config="plotHarvestHouse.buildingCountText" />
          </template>
        </v-layer>
      </v-stage>
    </section>

    <div class="flex gap-2">
      <div class="p-2 px-4 bg-palia-dark-blue rounded-md w-fit">
        <p class="flex items-center gap-2 text-lg">
          <nuxt-img
            width="16" height="16" src="/gold.webp" class="max-h-[1.5rem]" :srcset="undefined" placeholder
            alt="Gold" format="webp"
          />
          {{ totalPrice.toLocaleString() }}
        </p>
      </div>
      <div class="p-2 px-4 bg-palia-dark-blue rounded-md w-fit flex gap-4">
        <p class="flex items-center gap-2 text-lg">
          <nuxt-img
            width="32" height="32" src="/items/sapwood-plank.png" class="max-h-[3rem] aspect-auto object-contain"
            :srcset="undefined" placeholder alt="Gold" format="webp"
          />
          {{ totalMaterials.sapwoodPlanks.toLocaleString() }}
        </p>
        <p class="flex items-center gap-2 text-lg">
          <nuxt-img
            width="32" height="32" src="/items/stone-brick.png" class="max-h-[3rem] aspect-auto object-contain"
            :srcset="undefined" placeholder alt="Gold" format="webp"
          />
          {{ totalMaterials.stoneBricks.toLocaleString() }}
        </p>
      </div>
    </div>

    <div class="flex gap-8 p-4 bg-palia-dark-blue rounded-md text-xs w-fit">
      <div>
        <input v-model="useBuildingLimits" type="checkbox" class="toggle">
        <p>Use Build Limits</p>
      </div>
      <div>
        <input v-model="showRoofCollisions" type="checkbox" class="toggle">
        <p>Show Roof Collisions</p>
      </div>
    </div>
    <DevOnly>
      <div class=" bg-neutral p-4 rounded-md font-mono mb-4">
        <p class="text-lg uppercase font-bold">
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
    </DevOnly>
  </section>
</template>
