<script setup lang="ts">
import type { CropType} from '~/assets/scripts/garden-planner/imports';
import { Bonus, getCropFromType } from '~/assets/scripts/garden-planner/imports';
import { ItemType, parseCropId, type ICropNameWithGrowthDiff } from '~/assets/scripts/garden-planner/utils/garden-helpers';
import SettingsMinutesDisplay from '../SettingsMinutesDisplay.vue';
import CropSize from '~/assets/scripts/garden-planner/enums/crop-size';
import { formatToOneDecimal } from '~/utils/formatters'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'


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

    const type: 'seeds' | 'preserves' = (processType === ItemType.Seed) ? 'seeds' : 'preserves';

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
    <section
        class="bg-accent  border-misc-dark rounded-sm border overflow-y-auto max-h-102 dark:bg-palia-blue dark:text-accent dark:border-palia-blue-dark">
        <table
            class="table table-sm table-pin-rows [&_tr]:even:bg-secondary/50 [&_tr]:border-b-transparent dark:[&_tr]:even:bg-palia-blue-light/60 ">
            <thead>
                <tr class="bg-misc dark:bg-palia-blue-dark text-accent">
                    <th>
                        <FontAwesomeIcon :icon="['fas', 'seedling']" class="text-accent pr-1" />Crop Data
                        <span v-if="hasGrowthBoostDivide" class="text-xs italic">- Includes {{
                            cropIdParsed.hasGrowthBoost ? 'Non-Growth-Boosted Crops' : 'Growth-Boosted Crops' }}</span>
                    </th>
                    <th/>
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
                    <tr class="bg-misc dark:bg-palia-blue-dark text-accent">
                        <th>
                            <FontAwesomeIcon :icon="['fas', 'wheat-awn']" class="text-accent pr-1" />Harvest Data
                            <span v-if="hasGrowthBoostDivide" class="text-xs italic">- {{
                                cropIdParsed.hasGrowthBoost ? 'Non-Growth-Boosted Crops' : 'Growth-Boosted Crops' }}
                                excluded from here</span>
                        </th>
                        <th/>
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
                    </template>

                    <tr>
                        <th colspan="2">Growth Tick: In-game days elapsed on player's plot</th>
                    </tr>
                    <template v-if="cycleData.phases.length > 1">
                        <tr>
                            <th class="">Growth Ticks / Harvest <span>(First)</span></th>
                            <td>{{ cycleData.phases.at(0)?.phaseLength }}</td>
                        </tr>
                        <tr>
                            <th class="">Growth Ticks / Harvest (2, 3, 4)</th>
                            <td>{{ cycleData.phases.at(1)?.phaseLength }}</td>
                        </tr>
                    </template>
                    <tr>
                        <th class="">Growth Ticks / Cycle</th>
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
                        <th>Last Harvest Growth Tick</th>
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
                    <tr class="bg-misc dark:bg-palia-blue-dark text-accent">
                        <th colspan="2" class="capitalize">
                            <FontAwesomeIcon :icon="['fas', 'star']" class="text-accent pr-1" />Output Stats
                        </th>
                    </tr>
                </thead>

                <tbody class="">
                    <tr>
                        <th>Produce Sold</th>
                        <td>{{ (outputInfo.count).toLocaleString() }}
                            <span class="capitalize">{{ outputInfo.itemType + (outputInfo.count > 1 ? 's' : '')
                                }}</span>
                        </td>
                    </tr>
                    <tr>
                        <th>Total Gold Generated</th>
                        <td class="flex items-center gap-0.5"><img
                        width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4" :srcset="undefined"
                                alt="Gold" format="webp">{{ formatToOneDecimal(totalGoldGenerated).toLocaleString()
                                }} Gold</td>
                    </tr>
                    <tr>
                        <th class="indent-3">Total Gold / Tile</th>
                        <td class="flex items-center gap-0.5"><img
                                width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4" :srcset="undefined"
                                alt="Gold" format="webp">{{ formatToOneDecimal(totalGoldGenerated /
                                    tileCount).toLocaleString() }} Gold / Tile</td>
                    </tr>
                    <tr>
                        <th class="indent-3">Total Gold / Tick</th>
                        <td class="flex items-center gap-0.5"><img
                            width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4" :srcset="undefined"
                                alt="Gold" format="webp">{{ (formatToOneDecimal(totalGoldGenerated /
                                    lastGrowthTick)).toLocaleString() }} Gold / Growth Tick
                        </td>
                    </tr>
                    <tr>
                        <th class="indent-3">Total Gold / Tile / Tick</th>
                        <td class="flex items-center gap-0.5"><img
                                width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4" :srcset="undefined"
                                alt="Gold" format="webp">{{ (formatToOneDecimal((totalGoldGenerated /
                                    tileCount) / lastGrowthTick)).toLocaleString() }} Gold</td>
                    </tr>
                </tbody>
            </template>
            <template
                v-if="processor.settings.cropSettings.get(cropId)?.processAs !== ItemType.Crop && outputInfoWithProcessing && detailedProcessingInfo">
                <thead>
                    <tr class="bg-misc dark:bg-palia-blue-dark text-accent">
                        <th colspan="2" class="capitalize">
                            <FontAwesomeIcon :icon="['fas', 'stopwatch']" class="text-accent pr-1" />Process Stats
                        </th>
                    </tr>
                </thead>

                <tbody class="">

                    <tr>
                        <th colspan="2">Absolute Time: Time without crafter division</th>
                    </tr>
                    <tr>
                        <th class="indent-3">Absolute Process Time</th>
                        <td>
                            <SettingsMinutesDisplay :minutes="outputInfoWithProcessing.minutesProcessedTotal" />
                        </td>
                    </tr>
                    <tr>
                        <th class="indent-3">Absolute Process Time / Cycle</th>
                        <td>
                            <SettingsMinutesDisplay
                                :minutes="outputInfoWithProcessing.minutesProcessedTotal / totalCycles" />
                        </td>
                    </tr>


                    <tr>
                        <th colspan="2">Crafter Stats</th>
                    </tr>
                    <tr>
                        <th class="indent-3">Assigned Crafters</th>
                        <td>{{ cropSettings.crafters }} <template v-if="cropSettings.processAs === ItemType.Seed">
                                {{ cropSettings.crafters !== 1 ? 'Seed Collectors' : 'Seed Collector' }}
                            </template><template v-else-if="cropSettings.processAs === ItemType.Preserve">
                                {{ cropSettings.crafters !== 1 ? 'Preserve Jars' : 'Preserve Jar' }}
                            </template><template v-else>
                                {{ cropSettings.crafters !== 1 ? 'Crafters' : 'Crafter' }}
                            </template></td>
                    </tr>
                    <tr>
                        <th colspan="2">Distributed Time: Time with crafter division (includes idle time and waiting for
                            harvests)</th>
                    </tr>

                    <tr>
                        <th class="indent-3">Total Distributed Processing Time</th>
                        <td>
                            <SettingsMinutesDisplay :minutes="outputInfoWithProcessing.minutesProcessedEffective" />
                        </td>
                    </tr>

                    <tr>
                        <th class="indent-3">Average Distributed Time / <span>{{
                            detailedProcessingInfo.cycleData.at(0)!.cycleCrafterData.length >
                                1 ? 'Complete Cycles' :
                                'Harvest' }}</span></th>
                        <td>
                            <SettingsMinutesDisplay
                                :minutes="outputInfoWithProcessing.minutesProcessedEffective / Math.floor(totalCycles)" />
                            / {{
                                detailedProcessingInfo.cycleData.at(0)!.cycleCrafterData.length > 1 ? 'Cycle' : 'Harvest' }}
                        </td>
                    </tr>

                    <template v-if="detailedProcessingInfo.cycleData.at(0)!.cycleCrafterData.length > 1">
                        <tr>
                            <th class="indent-3">Distributed Process Time (1st harvest)</th>
                            <td>
                                <SettingsMinutesDisplay
                                    :minutes="detailedProcessingInfo.cycleData.at(0)?.cycleCrafterData.at(0)?.longestProcessMinutes" />
                            </td>
                        </tr>
                        <tr>
                            <th class="indent-3">Distributed Process Time (Final harvest)</th>

                            <td>
                                <SettingsMinutesDisplay
                                    :minutes="detailedProcessingInfo.cycleData.at(-1)?.cycleCrafterData.at(-1)?.longestProcessMinutes" />
                            </td>
                        </tr>
                        <tr>
                            <th class="indent-3">Distributed Time / Growth Tick: 1st Harvest </th>
                            <td>
                                <SettingsMinutesDisplay
                                    :minutes="(detailedProcessingInfo.cycleData.at(averageCycleIndex)!.cycleCrafterData.at(0)!.longestProcessMinutes || 0) / (cycleData?.phases.at(0)?.phaseLength || 1)" />
                                / Growth Tick
                            </td>
                        </tr>
                        <tr>
                            <th class="indent-3">Distributed Time / Growth Tick: 3rd-4th Harvest</th>
                            <td>
                                <SettingsMinutesDisplay
                                    :minutes="(detailedProcessingInfo.cycleData.at(averageCycleIndex)!.cycleCrafterData.at(-1)!.longestProcessMinutes || 0) / (cycleData?.phases.at(-1)?.phaseLength || 1)" />
                                / Growth Tick
                            </td>
                        </tr>
                    </template>



                    <tr>
                        <th class="indent-3">Distributed Time / Growth Ticks ({{
                            detailedProcessingInfo.cycleData.at(0)!.cycleCrafterData.length > 1 ? 'Cycle' : 'Harvest'
                        }})
                        </th>
                        <td>
                            <SettingsMinutesDisplay :minutes="(detailedProcessingInfo.cycleData.at(averageCycleIndex)!.longestProcessMinutes) / (cycleData?.phases.at(-1)?.dayOfHarvest || 1)" />
                            / {{
                                detailedProcessingInfo.cycleData.at(0)!.cycleCrafterData.length > 1 ? 'Cycle' : 'Harvest' }}
                        </td>
                    </tr>
                    <tr>
                        <th colspan="2" class="">Gold Stats</th>
                    </tr>
                    <tr>
                        <th class="indent-3">Total Gold Produced</th>
                        <td class="flex items-center gap-0.5"><img
                            width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4" :srcset="undefined"
                                alt="Gold" format="webp">{{
                                    formatToOneDecimal(detailedProcessingInfo.totalGoldGenerated).toLocaleString() }} Gold</td>
                    </tr>
                    <tr>
                        <th class="indent-3">Total Gold / Cycle</th>
                        <td class="flex items-center gap-0.5"><img
                            width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4" :srcset="undefined"
                                alt="Gold" format="webp">{{
                                    formatToOneDecimal(detailedProcessingInfo.totalGoldGenerated /
                                        Math.floor(totalCycles)).toLocaleString() }}
                            Gold / Cycle</td>
                    </tr>
                    <tr>
                        <th class="indent-3">Total Gold / Hour (Distributed Time)</th>
                        <td class="flex items-center gap-0.5"><img
                            width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4" :srcset="undefined"
                                alt="Gold" format="webp">{{
                                    formatToOneDecimal(detailedProcessingInfo.totalGoldGenerated /
                                        (detailedProcessingInfo.effectiveProcessMinutes /
                                            60)).toLocaleString() }} Gold / Hour</td>
                    </tr>
                </tbody>
            </template>
        </table>
    </section>
</template>