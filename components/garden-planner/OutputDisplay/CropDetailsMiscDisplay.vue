<script setup lang="ts">
import { Bonus, Crop, crops, CropType, getCropFromType } from '~/assets/scripts/garden-planner/imports';
import { ItemType, parseCropId, type ICropNameWithGrowthDiff } from '~/assets/scripts/garden-planner/utils/garden-helpers';
import SettingsMinutesDisplay from '../SettingsMinutesDisplay.vue';
import CropSize from '~/assets/scripts/garden-planner/enums/crop-size';

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
const processor = useProcessor()


const plotStat = computed(() => gardenHandler.plotStat)
const cropGroupBonusStats = computed(() => gardenHandler.cropGropBonusStats)
const cycleData = computed(() => harvester.totalHarvest.cycleData.get(props.cropId))
const lastGrowthTick = computed(() => harvester.totalHarvest.lastHarvestDay)

const cropIdParsed = computed(() => parseCropId(props.cropId))

const tileCount = computed(() => {
    const cropCount = plotStat.value.cropTypeCount[cropIdParsed.value.type]
    const cropSize = getCropFromType(cropIdParsed.value.type)?.size

    let tileCount = cropCount

    switch (cropSize) {
        case CropSize.Bush:
            tileCount *= 4
            break;
        case CropSize.Tree:
            tileCount *= 9
            break
    }

    return tileCount
})

const hasGrowthBoostDivide = computed(() => {
    const { type, isStar } = cropIdParsed.value
    const baseId = `${type}-${isStar ? 'Star' : 'Base'}` satisfies ICropNameWithGrowthDiff
    return (harvester.totalHarvest.cycleData.has(baseId) && harvester.totalHarvest.cycleData.has(`${baseId}-Growth`))
})


const totalCycles = computed(() => lastGrowthTick.value / cycleData.value!.phases.at(-1)!.dayOfHarvest || 1)

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


const outputInfo = computed(() => {
    const processType = processor.settings.cropSettings.get(props.cropId)?.processAs

    let type: 'crops' | 'preserves' | 'seeds' = 'crops'
    switch (processType) {
        case ItemType.Preserve:
            type = 'preserves';
            break;
        case ItemType.Seed:
            type = 'seeds'
    }

    return processor.output[type].get(props.cropId)
})

const cropSettings = computed(() => {
    return processor.settings.cropSettings.get(props.cropId)!
})

const outputInfoWithProcessing = computed(() => {

    const processType = cropSettings.value.processAs

    if (processType !== ItemType.Preserve && processType !== ItemType.Seed)
        return undefined

    let type: 'seeds' | 'preserves' = (processType === ItemType.Seed) ? 'seeds' : 'preserves';

    return processor.processor.output[type].get(props.cropId)
})

const detailedProcessingInfo = computed(() => {
    return processor.processor.output.detailedProcessingInfo.get(props.cropId)
})

const averageCycleIndex = computed(() => {
    if (detailedProcessingInfo.value) {
        return Math.floor(detailedProcessingInfo.value.cycleData.length / 2)
    }

    return 0
})


const totalGoldGenerated = computed(() => {
    const processType = cropSettings.value.processAs
    const idModifier = processType === ItemType.Crop ? '' : `-${processType.charAt(0).toUpperCase()}${processType.slice(1)}`

    const inventoryData = processor.processor.inventory.get(`${props.cropId}${idModifier}`)

    if (inventoryData) {
        return (inventoryData.baseGoldValue * inventoryData.count)
    } else {
        return 0
    }
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
<!-- 
            <thead>
                <tr class="bg-misc text-accent">
                    <th>Fertiliser Data
                        <span class="text-xs italic" v-if="hasGrowthBoostDivide">- Includes {{
                            cropIdParsed.hasGrowthBoost ? 'Non-Growth-Boosted Crops' : 'Growth-Boosted Crops' }}</span>
                    </th>
                    <th></th>
                </tr>
            </thead> -->


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
                            <td>{{ Math.floor(totalCycles) }}</td>
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
                            <td colspan="2" class="italic">Growth Tick: In-game days elapsed on player's plot</td>
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
                        <th>Growth Ticks / Cycle</th>
                        <td>
                            {{ cycleData.phases.at(-1)?.dayOfHarvest }}
                        </td>
                    </tr>

                    <tr>
                        <th>Total Harvests</th>
                        <td>
                            {{ cycleData.totalHarvestsCount }}
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
            <template v-if="outputInfo">
                <thead>
                    <tr class="bg-misc text-accent">
                        <th colspan="2" class="capitalize">Output Stats</th>
                    </tr>
                </thead>

                <tbody class="">
                    <tr>
                        <th>Produce Sold</th>
                        <td>{{ outputInfo.count }}
                            <span class="capitalize">{{ outputInfo.itemType }}</span><template
                                v-if="outputInfo.count > 1">s</template>
                        </td>
                    </tr>
                    <tr>
                        <th>Overall Gold Generated</th>
                        <td>{{ (totalGoldGenerated).toLocaleString() }} Gold</td>
                    </tr>
                    <tr>
                        <th>Overall Gold / Tile</th>
                        <td>{{ (totalGoldGenerated / tileCount).toLocaleString() }} Gold / Tile</td>
                    </tr>
                    <tr>
                        <th>Overall Gold / Tick</th>
                        <td>{{ (Math.round(totalGoldGenerated / lastGrowthTick)).toLocaleString() }} Gold / Growth Tick
                        </td>
                    </tr>
                    <tr>
                        <th>Overall Gold / Tile / Tick</th>
                        <td>{{ (Math.round((totalGoldGenerated / tileCount) / lastGrowthTick)).toLocaleString() }} Gold
                            / Growth Tick</td>
                    </tr>
                </tbody>
            </template>
            <template
                v-if="processor.settings.cropSettings.get(cropId)?.processAs !== ItemType.Crop && outputInfoWithProcessing && detailedProcessingInfo">
                <thead>
                    <tr class="bg-misc text-accent">
                        <th colspan="2" class="capitalize">Process Stats</th>
                    </tr>
                </thead>

                <tbody class="">
                    <tr>
                        <th>Effective Process Time (1st harvest)</th>
                        <td>
                            <SettingsMinutesDisplay
                                :minutes="detailedProcessingInfo.cycleData.at(0)?.cycleCrafterData.at(0)?.longestProcessMinutes" />
                        </td>
                    </tr>
                    <tr>
                        <th>Effective Process Time (Final harvest)</th>

                        <td>
                            <SettingsMinutesDisplay
                                :minutes="detailedProcessingInfo.cycleData.at(-1)?.cycleCrafterData.at(-1)?.longestProcessMinutes" />
                        </td>
                    </tr>
                    <tr>
                        <th colspan="2" class="italic">Crafter Stats</th>
                    </tr>
                    <tr>
                        <th colspan="2" class="italic">Absolute Time: Time without crafter division</th>
                    </tr>
                    <tr>
                        <th>Absolute Process Time</th>
                        <td>
                            <SettingsMinutesDisplay :minutes="outputInfoWithProcessing.minutesProcessedTotal" />
                        </td>
                    </tr>
                    <tr>
                        <th>Absolute Process Time / Cycle</th>
                        <td>
                            <SettingsMinutesDisplay
                                :minutes="outputInfoWithProcessing.minutesProcessedTotal / totalCycles" />
                        </td>
                    </tr>
                    <tr>
                        <th>Crafters</th>
                        <td>{{ cropSettings.crafters }} Crafter<span v-show="cropSettings.crafters !== 1">s</span></td>
                    </tr>


                    <tr>
                        <th colspan="2" class="italic">Average Harvest Time Stats</th>
                    </tr>
                    <tr>
                        <th colspan="2" class="italic">Effective Time: Time with crafter division</th>
                    </tr>
                    <template v-if="detailedProcessingInfo.cycleData.at(0)!.cycleCrafterData.length > 1">
                        <tr>
                            <th>Effective Time / Growth Ticks: 1st Harvest </th>
                            <td>
                                <SettingsMinutesDisplay
                                    :minutes="(detailedProcessingInfo.cycleData.at(averageCycleIndex)!.cycleCrafterData.at(0)!.longestProcessMinutes || 0) / (cycleData?.phases.at(0)?.phaseLength || 1)" />
                                / Growth Tick
                            </td>
                        </tr>
                        <tr>
                            <th>Effective Time / Growth Ticks: 3rd-4th Harvest</th>
                            <td>
                                <SettingsMinutesDisplay
                                    :minutes="(detailedProcessingInfo.cycleData.at(averageCycleIndex)!.cycleCrafterData.at(-1)!.longestProcessMinutes || 0) / (cycleData?.phases.at(-1)?.phaseLength || 1)" />
                                / Growth Tick
                            </td>
                        </tr>
                    </template>

                    <tr>
                        <th>Effective Time / <span>{{ detailedProcessingInfo.cycleData.at(0)!.cycleCrafterData.length >
                            1 ? 'Cycle' :
                                'Harvest' }}</span></th>
                        <td>
                            <SettingsMinutesDisplay
                                :minutes="outputInfoWithProcessing.minutesProcessedEffective / Math.floor(totalCycles)" />
                            / {{
                                detailedProcessingInfo.cycleData.at(0)!.cycleCrafterData.length > 1 ? 'Cycle' : 'Harvest' }}
                        </td>
                    </tr>

                    <tr>
                        <th>Overall Effective Processing Time</th>
                        <td>
                            <SettingsMinutesDisplay :minutes="outputInfoWithProcessing.minutesProcessedEffective" />
                        </td>
                    </tr>


                    <tr>
                        <th colspan="2" class="italic">Process Time / Growth Ticks</th>
                    </tr>
                    <tr>
                        <th colspan="2" class="italic">Gold Stats</th>
                    </tr>
                    <tr>
                        <th>Overall Gold Produced</th>
                        <td>{{ detailedProcessingInfo.totalGoldGenerated.toLocaleString() }} Gold</td>
                    </tr>
                    <tr>
                        <th>Overall Gold / Cycle</th>
                        <td>{{ (detailedProcessingInfo.totalGoldGenerated / Math.floor(totalCycles)).toLocaleString() }}
                            Gold / Cycle</td>
                    </tr>
                    <tr>
                        <th>Overall Gold / Effective Hour</th>
                        <td>{{ (detailedProcessingInfo.totalGoldGenerated /
                            (detailedProcessingInfo.effectiveProcessMinutes /
                                60)).toLocaleString() }} Gold / Hour</td>
                    </tr>
                </tbody>
            </template>
        </table>
    </section>
</template>