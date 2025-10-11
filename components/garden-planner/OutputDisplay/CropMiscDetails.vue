<script setup lang="ts">
import { Bonus, CropType } from '~/assets/scripts/garden-planner/imports';
import { parseCropId, type ICropNameWithGrowthDiff } from '~/assets/scripts/garden-planner/utils/garden-helpers';

const props = defineProps({
    cropType: {
        type: String as PropType<CropType>,
        required: true
    },
    cropId: {
        type: String as PropType<ICropNameWithGrowthDiff>,
        required: true
    }
})

const gardenHandler = useGarden()
const harvester = useHarvester()


const plotStat = computed(() => gardenHandler.plotStat)
const cropGroupBonusStats = computed(() => gardenHandler.cropGropBonusStats)
const cycleData = computed(() => harvester.totalHarvest.cycleData.get(props.cropId))
const lastGrowthTick = computed(() => harvester.totalHarvest.lastHarvestDay)

const cropIdParsed = computed(() => parseCropId(props.cropId))

const hasGrowthBoostDivide = computed(() => {
    const { type, isStar } = cropIdParsed.value
    const baseId = `${type}-${isStar ? 'Star' : 'Base'}` satisfies ICropNameWithGrowthDiff
    return (harvester.totalHarvest.cycleData.has(baseId) && harvester.totalHarvest.cycleData.has(`${baseId}-Growth`))
})


const incompleteHarvests = computed(() => {
    if (!cycleData.value)
        return 0

    const lastDayOfGrowth = cycleData.value.phases.at(-1)!.dayOfHarvest
    const completedCycles = Math.floor(lastGrowthTick.value / lastDayOfGrowth)
    const daysRemaining = lastGrowthTick.value - (lastDayOfGrowth * completedCycles)

    let incompleteCycleHarvestsCount = 0
    for (let index = 0; index < cycleData.value.phases.length; index++) {
        if (cycleData.value.phases.at(index)!.dayOfHarvest <= daysRemaining) {
            incompleteCycleHarvestsCount++
        }
    }

    return incompleteCycleHarvestsCount
})

const lastDayCropWasHarvested = computed(() => {
    if (!cycleData.value)
        return 0

    const lastDayOfGrowth = cycleData.value.phases.at(-1)!.dayOfHarvest
    const completedCycles = Math.floor(lastGrowthTick.value / lastDayOfGrowth)

    return lastDayOfGrowth * completedCycles +
        ((incompleteHarvests.value > 0) ? cycleData.value.phases.at(incompleteHarvests.value - 1)!.dayOfHarvest : 0)
})

</script>
<template>
    <section class="bg-accent border-misc-dark rounded-sm border overflow-y-auto max-h-102">
        <table
            class="table table-sm table-pin-rows [&_tr]:not-last:border-b [&_tr]:even:bg-secondary/80 [&_tr]:border-b-misc">

            <thead>
                <tr class="bg-misc text-accent">
                    <th>Crop Data
                        <span class="text-xs italic" v-if="hasGrowthBoostDivide">- Includes {{
                            cropIdParsed.hasGrowthBoost ? 'Non-Growth-Boosted Crops' : 'Growth-Boosted Crops' }}</span>
                    </th>
                    <th></th>
                </tr>
            </thead>

            <tbody class="">

                <tr>
                    <th>Growth Boosted Crops</th>
                    <td>{{ cropGroupBonusStats.get(cropType)?.[Bonus.SpeedIncrease] }} / {{
                        plotStat.cropTypeCount[cropType] }}
                        ({{ Math.round(((cropGroupBonusStats.get(cropType)?.[Bonus.SpeedIncrease] || 0) /
                            (plotStat.cropTypeCount[cropType])) * 100) }}%)</td>
                </tr>

                <tr>
                    <th>Harvest Boosted Crops</th>
                    <td>{{ cropGroupBonusStats.get(cropType)?.[Bonus.HarvestIncrease] }} / {{
                        plotStat.cropTypeCount[cropType] }}
                        ({{ Math.round(((cropGroupBonusStats.get(cropType)?.[Bonus.HarvestIncrease] || 0) /
                            (plotStat.cropTypeCount[cropType])) * 100) }}%)</td>
                </tr>
                <tr>
                    <th>Quality Boosted Crops</th>
                    <td>{{ cropGroupBonusStats.get(cropType)?.[Bonus.QualityIncrease] }} / {{
                        plotStat.cropTypeCount[cropType] }}
                        ({{ Math.round(((cropGroupBonusStats.get(cropType)?.[Bonus.QualityIncrease] || 0) /
                            (plotStat.cropTypeCount[cropType])) * 100) }}%)</td>
                </tr>
                <tr>
                    <th>Water Boosted Crops</th>
                    <td>{{ cropGroupBonusStats.get(cropType)?.[Bonus.WaterRetain] }} / {{
                        plotStat.cropTypeCount[cropType] }}
                        ({{ Math.round(((cropGroupBonusStats.get(cropType)?.[Bonus.WaterRetain] || 0) /
                            (plotStat.cropTypeCount[cropType])) * 100) }}%)</td>
                </tr>
                <tr>
                    <th>Weed Protected Crops</th>
                    <td>{{ cropGroupBonusStats.get(cropType)?.[Bonus.WeedPrevention] }} / {{
                        plotStat.cropTypeCount[cropType] }}
                        ({{ Math.round(((cropGroupBonusStats.get(cropType)?.[Bonus.WeedPrevention] || 0) /
                            (plotStat.cropTypeCount[cropType])) * 100) }}%)</td>
                </tr>
            </tbody>

            <template v-if="cycleData">
                <thead>
                    <tr class="bg-misc text-accent">
                        <th>Harvest Data
                            <span class="text-xs italic" v-if="hasGrowthBoostDivide">- {{
                                cropIdParsed.hasGrowthBoost ? 'Non-Growth-Boosted Crops' : 'Growth-Boosted Crops' }}
                                excluded from here</span>
                        </th>
                        <th></th>
                    </tr>
                </thead>
                <tbody class="">
                    <template v-if="cycleData.phases.length > 1">

                        <tr>
                            <th>Complete Cycles</th>
                            <td>{{ Math.floor(lastGrowthTick / cycleData.phases.at(-1)!.dayOfHarvest || 1) }}</td>
                        </tr>
                        <tr>
                            <th>
                                Harvests past last complete cycle
                            </th>
                            <td>
                                {{ incompleteHarvests }}
                            </td>
                        </tr>
                        <tr>
                            <th>Growth Ticks / Harvest <span>(First)</span></th>
                            <td>{{ cycleData.phases.at(0)?.phaseLength }}</td>
                        </tr>
                        <tr>
                            <th>Growth Ticks / Harvest (2, 3, 4)</th>
                            <td>{{ cycleData.phases.at(1)?.phaseLength }}</td>
                        </tr>
                    </template>
                    <tr>
                        <th>Total Harvests</th>
                        <td>
                            {{ cycleData.totalHarvestsCount }}
                        </td>
                    </tr>
                    <tr>
                        <th>Growth Ticks / Cycle</th>
                        <td>
                            {{ cycleData.phases.at(-1)?.dayOfHarvest }}
                        </td>
                    </tr>

                    <tr>
                        <th>Growth tick last harvested</th>
                        <td>{{ lastDayCropWasHarvested }}</td>
                    </tr>
                    <tr>
                        <th>Harvest Days / Total Growth Ticks</th>
                        <td>{{ cycleData.totalHarvestsCount }} / {{ lastGrowthTick }} ({{
                            Math.round((cycleData.totalHarvestsCount / lastGrowthTick) * 100) }}%)</td>
                    </tr>
                </tbody>
            </template>
            <thead>
                <tr class="bg-misc text-accent">
                    <th colspan="2" class="capitalize">Process Data</th>
                </tr>
            </thead>

            <tbody class="">


                <tr>
                    <th>Process Time (1st harvest)</th>
                    <td>?? Days ?? Hrs ?? Minutes</td>
                </tr>
                <tr>
                    <th>Process Time (Final harvest)</th>
                    <td>?? Days ?? Hrs ?? Minutes</td>
                </tr>


                <tr>
                    <th colspan="2" class="italic">Average Harvest</th>
                </tr>

                <tr>
                    <th>Process Time / Harvest: 1st - 3rd</th>
                    <td>?? Days ?? Hrs ?? Minutes</td>
                </tr>
                <tr>
                    <th>Process Time / Harvest: 4th</th>
                    <td>?? Days ?? Hrs ?? Minutes</td>
                </tr>
            
                <tr>
                    <th>Overall Processing Time</th>
                    <td>?? Days ?? Hrs ?? Minutes</td>
                </tr>


                <tr>
                    <th colspan="2" class="italic">Growth Ticks per Process Time</th>
                </tr>

                <tr>
                    <th>Growth Ticks / Process Time (Harvest: 1st - 3rd)</th>
                    <td>?? Days ?? Hrs ?? Minutes per Tick</td>
                </tr>
                <tr>
                    <th>Growth Ticks / Process Time (Harvest: 4th)</th>
                    <td>?? Days ?? Hrs ?? Minutes per Tick</td>
                </tr>
                <tr>
                    <th>Growth Ticks / Process Time (Cycle)</th>
                    <td>?? Days ?? Hrs ?? Minutes per Tick</td>
                </tr>
                <tr>
                    <th>Growth Ticks / Process Time (Overall)</th>
                    <td>?? Days ?? Hrs ?? Minutes per Tick</td>
                </tr>
            </tbody>
        </table>
    </section>
</template>