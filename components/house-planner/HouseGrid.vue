<script setup lang="ts">
import { useHousePlanConfig } from '@/stores/useHousePlanConfig'

const stageConfig = useHousePlanConfig()

const STAGE_WIDTH = stageConfig.width
const STAGE_HEIGHT = stageConfig.height

const configBackground = ref({
  x: 0,
  y: 0,
  width: stageConfig.width,
  height: stageConfig.height,
  fill: '#419257',
})
</script>

<template>
  <v-layer>
    <v-rect :config="configBackground" />
    <template v-for="plot in 9" :key="plot">
      <v-line
        :config="{
          points: [plot * (STAGE_WIDTH / 9), 0, plot * (STAGE_WIDTH / 9), STAGE_HEIGHT],
          stroke: 'white',
          strokeWidth: 1,
          opacity: 0.4,
        }"
      />
    </template>
    <template v-for="plot in 5" :key="plot">
      <v-line
        :config="{
          points: [0, plot * (STAGE_HEIGHT / 5), STAGE_WIDTH, plot * (STAGE_HEIGHT / 5)],
          stroke: 'white',
          strokeWidth: 1,
          opacity: 0.4,
        }"
      />
    </template>

    <template v-for="plot in 9" :key="plot">
      <template v-for="plotTile in 13" :key="plotTile">
        <v-line
          :config="{
            points: [plotTile * ((STAGE_WIDTH / 9) / 13) + ((plot - 1) * (STAGE_WIDTH / 9)), 0, plotTile * ((STAGE_WIDTH / 9) / 13) + ((plot - 1) * (STAGE_WIDTH / 9)), STAGE_HEIGHT],
            stroke: 'white',
            strokeWidth: (plotTile === 7) ? 0.3 : 0.1,
            opacity: 0.3,
          }"
        />
      </template>
    </template>

    <template v-for="plot in 5" :key="plot">
      <template v-for="plotTile in 13" :key="plotTile">
        <v-line
          :config="{
            points: [0, plotTile * ((STAGE_HEIGHT / 5) / 13) + ((plot - 1) * (STAGE_HEIGHT / 5)), STAGE_WIDTH, plotTile * ((STAGE_HEIGHT / 5) / 13) + ((plot - 1) * (STAGE_HEIGHT / 5))],
            stroke: 'white',
            strokeWidth: (plotTile === 7) ? 0.3 : 0.1,
            opacity: 0.3,
          }"
        />
      </template>
    </template>
  </v-layer>
</template>
