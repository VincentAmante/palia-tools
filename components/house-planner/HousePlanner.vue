<script setup lang="ts">
import type Konva from 'konva'
import HouseGrid from './HouseGrid.vue'
import type Building from '@/assets/scripts/house-planner/classes/building'
import { HarvestHouse } from '@/assets/scripts/house-planner/imports'
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
    [harvestHouse.value.id]: harvestHouse.value,
  },
)

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

      harvestHouse.value.updateCoords({ x: snappedX, y: snappedY })
      const building = findBuildingById(harvestHouse.value.id)
      if (building) {
        building.snapBox.x = snappedX
        building.snapBox.y = snappedY

        building.image.x = snappedX
        building.image.y = snappedY
      }
    })

    window.addEventListener('keydown', (e) => {
      const building = findBuildingById(harvestHouse.value.id)

      if (e.code === 'KeyQ')
        building.rotateBuilding(-90)
      else if (e.code === 'KeyE')
        building.rotateBuilding(90)
    })
  }
})

function findBuildingById(id: string) {
  return buildings.value[id]
}
</script>

<template>
  <section class="px-16">
    <div class="flex gap-2 flex-wrap py-1" />
    <v-stage ref="stage" :config="configKonva">
      <HouseGrid />
      <v-layer>
        <v-text :config="text" />
        <template v-for="building in buildings" :key="building.id">
          <v-rect :config="building.snapBox" />
          <v-image :config="building.image" />
        </template>
      </v-layer>
    </v-stage>
  </section>
</template>
