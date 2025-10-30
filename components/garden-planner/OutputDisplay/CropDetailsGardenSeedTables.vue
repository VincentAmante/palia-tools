<script setup lang="ts">
import useHarvester from '~/stores/useHarvester'
import useGarden from '~/stores/useGarden'
import { parseCropId, type ICropNameWithGrowthDiff } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import { getCropFromType, type CropType } from '~/assets/scripts/garden-planner/imports'
const harvester = useHarvester()
const garden = useGarden()

const plotStat = computed(() => garden.plotStat)
const cycleData = computed(() => harvester.harvester.totalHarvest.cycleData)

const lastGrowthTick = computed(() => harvester.harvester.totalHarvest.lastHarvestDay)

const totalSeedCounts = computed(() => {
    const seedCountsTracker: Map<CropType, number> = new Map()
    let totalSeedsUsed = 0;

    for (const [id, cropCycleData] of cycleData.value.entries()) {
        const { type } = parseCropId(id)
        let seedCountTracker = seedCountsTracker.get(type) ?? 0
        const seedsUsed = (cropCycleData.cropCount * Math.floor(cropCycleData.totalHarvestsCount / cropCycleData.phases.length))

        seedCountTracker += seedsUsed
        totalSeedsUsed += seedsUsed
        seedCountsTracker.set(type, seedCountTracker)
    }

    return {
        totalCount: totalSeedsUsed,
        individualCount: seedCountsTracker
    }
})
</script>

<template>
    <thead>
        <tr class="bg-misc text-accent">
            <th colspan="2">Seed Data</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>Total Seeds Used ({{ lastGrowthTick }} Days)</th>
            <td>{{ totalSeedCounts.totalCount }}</td>
        </tr>
        <tr v-for="[type, count] of totalSeedCounts.individualCount">
            <th class="indent-3 capitalize">{{ type }}</th>
            <td>{{ count }}</td>
        </tr>
    </tbody>
</template>