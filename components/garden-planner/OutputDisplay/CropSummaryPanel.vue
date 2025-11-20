<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import useHarvester from '~/stores/useHarvester'
import useProcessor from '~/stores/useProcessor'
import { ItemType, parseCropId, type ICropName, type ICropNameWithGrowthDiff } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import { CropType } from '~/assets/scripts/garden-planner/imports'
import { getCropFromType } from '~/assets/scripts/garden-planner/imports'
import ItemDisplay from '../HarvestCalculator/ItemDisplay.vue'
import { formatMinutesToDaysHoursMinutes } from '~/utils/formatters' // Assuming a formatter utility exists or needs creation
import ItemDisplayAlt from '../HarvestCalculator/ItemDisplayAlt.vue'


const harvester = useHarvester()
const processor = useProcessor()
const props = defineProps({
    selectedCropDetail: {
        type: String as PropType<ICropNameWithGrowthDiff>,
        required: true
    }
})

// Computed property for selected crop's cycle data
const selectedCropCycleData = computed(() => {
    if (!props.selectedCropDetail || !harvester.harvester.totalHarvest?.cycleData) {
        return null
    }

    const { type, hasGrowthBoost } = parseCropId(props.selectedCropDetail)
    const totalHarvestCycleId = `${type}${(harvester.settings.useStarSeeds ? '-Star' : '-Base')}${(harvester.settings.useGrowthBoost && hasGrowthBoost) ? '-Growth' : ''}` satisfies ICropNameWithGrowthDiff

    return harvester.harvester.totalHarvest.cycleData.get(totalHarvestCycleId)
})


// Gets cycle detail which relies on selected crop detail
const cycleId = computed(() => {
    if (!props.selectedCropDetail || !harvester.dayHarvests || harvester.dayHarvests.size === 0)
        return ''

    return `${parseCropId(props.selectedCropDetail).type}${harvester.settings.useStarSeeds ? '-Star' : '-Base'}` satisfies ICropName
})

const cropInfo = computed(() => {
    return parseCropId(props.selectedCropDetail || '')
})

// Computed property for selected crop's processing data
const selectedCropProcessingData = computed(() => {

    if (!props.selectedCropDetail || !processor.output?.detailedProcessingInfo)
        return null

    const detailedProcessingInfoOutput = processor.output.detailedProcessingInfo.get(props.selectedCropDetail)

    if (detailedProcessingInfoOutput && detailedProcessingInfoOutput.cycleData.length > 0) {
        return detailedProcessingInfoOutput
    }

    else return null
})

const selectedCropIsProcessedAs = computed(() => {
    if (!props.selectedCropDetail) {
        return null
    }

    return processor.settings.cropSettings.get(props.selectedCropDetail satisfies ICropNameWithGrowthDiff)?.processAs
})

const canFinishBeforeNextHarvest = computed(() => {
    if (!props.selectedCropDetail || !processor.output?.detailedProcessingInfo)
        return null

    const detailedProcessingInfoOutput = processor.output.detailedProcessingInfo.get(props.selectedCropDetail)?.cycleData

    let canFinishBeforeNextHarvest = true

    if (detailedProcessingInfoOutput) {
        for (const detailedProcessingInfo of detailedProcessingInfoOutput) {
            for (const crafter of detailedProcessingInfo.cycleCrafterData) {
                if (!crafter.canFinishBeforeNextHarvest)
                    canFinishBeforeNextHarvest = false
            }
        }

        return canFinishBeforeNextHarvest
    }
})

// Computed property for seeds required per replant event
const selectedCropSeedsRequiredPerHarvest = computed(() => {
    if (!props.selectedCropDetail || !harvester.dayHarvests || harvester.dayHarvests.size === 0 || !cycleId.value)
        return null

    // Find the first day harvest that requires this specific seed type
    for (const [, dayHarvest] of harvester.dayHarvests) {
        if (dayHarvest.seedsRequired.has(cycleId.value))
            return dayHarvest.seedsRequired.get(cycleId.value)
    }
    return null // No replanting occurred or required for this specific type
})

// Computed property for total seeds required over the simulation
const selectedCropTotalSeedsRequired = computed(() => {
    if (!props.selectedCropDetail || !harvester.dayHarvests || harvester.dayHarvests.size === 0 || !cycleId.value)
        return 0

    let total = 0
    for (const [, dayHarvest] of harvester.dayHarvests) {
        if (dayHarvest.seedsRequired.has(cycleId.value))
            total += dayHarvest.seedsRequired.get(cycleId.value)?.count || 0
    }
    return total
})

// Computed property for cycle duration
const selectedCropCycleDuration = computed(() => {
    if (!selectedCropCycleData.value)
        return 0
    return selectedCropCycleData.value.phases.reduce((sum, phase) => sum + phase.phaseLength, 0)
})

// Computed property for total full cycles
const selectedCropTotalFullCycles = computed(() => {
    if (!selectedCropCycleData.value || selectedCropCycleData.value.phases.length === 0)
        return 0
    return Math.floor(selectedCropCycleData.value.totalHarvestsCount / selectedCropCycleData.value.phases.length)
})

const selectedCropAsCrop = computed(() => {
    if (!props.selectedCropDetail) {
        return getCropFromType(CropType.None)
    }

    return getCropFromType(parseCropId(props.selectedCropDetail).type)
})
</script>


<template>
    <section v-if="selectedCropDetail && selectedCropCycleData"
        class="flex flex-col gap-2 dark:text-accent">
        <!-- Cycle Info -->
        <section class="p-2 bg-accent dark:bg-palia-blue-dark rounded-md flex flex-col gap-1">
            <h3 class="text-sm font-semibold text-palia-blue-dark dark:text-accent">Harvest Info</h3>
            <div class="flex flex-wrap gap-1 text-sm">
                <p class="font-semibold badge badge-sm dark:bg-palia-blue">{{ selectedCropCycleData.phases.length
                }}<span class="">{{ selectedCropCycleData.phases.length !== 1 ? 'Harvests' : 'Harvest' }}</span>/
                    {{
                        selectedCropCycleDuration }} Days
                </p>
                <p class="font-semibold badge badge-sm dark:bg-palia-blue">{{ selectedCropTotalFullCycles }}
                    {{ selectedCropTotalFullCycles !== 1 ? 'Cycles' : 'Cycle' }}</p>
                <p v-if="selectedCropTotalFullCycles !== selectedCropCycleData.totalHarvestsCount"
                    class="font-semibold badge badge-sm dark:bg-palia-blue">
                    {{ selectedCropCycleData.totalHarvestsCount }} Total Harvests</p>
                <p class="font-semibold badge badge-sm dark:bg-palia-blue"
                    v-if="selectedCropSeedsRequiredPerHarvest && (cropInfo.isStar === parseCropId(cycleId).isStar)">
                    <span class="font-semibold">Seeds per Replant:</span>&nbsp;{{
                        selectedCropSeedsRequiredPerHarvest.count }}
                </p>
                <p class="font-semibold badge badge-sm dark:bg-palia-blue" v-else>
                    <span class="font-semibold">Seeds per Replant:</span>&nbsp;N/A
                </p>
                <p v-if="(selectedCropSeedsRequiredPerHarvest?.count || 0) !== selectedCropTotalSeedsRequired && (cropInfo.isStar === parseCropId(cycleId).isStar)"
                    class="font-semibold badge badge-sm dark:bg-palia-blue"><span class="font-semibold">Total Seeds
                        Used:</span>&nbsp;{{
                            selectedCropTotalSeedsRequired }}</p>
            </div>
            <div class="flex gap-1">
                <div class="bg-primary dark:bg-palia-blue p-2 rounded-sm w-fit">
                    <p class="text-xs p-0.5 font-bold">Growth Ticks / Cycle</p>
                    <ul class="flex flex-wrap gap-2 pt-1">
                        <template v-for="harvestYield in selectedCropCycleData.phases">
                            <li class="flex flex-col">
                                <p class="text-xs">Day {{ harvestYield.dayOfHarvest }}</p>
                                <ItemDisplay class="max-w-12 dark:border dark:border-water-retain" :imgSrc="selectedCropAsCrop?.image"
                                    :imgAlt="selectedCropAsCrop?.type" :star="cropInfo.isStar"
                                    :count="(harvestYield.yield[(cropInfo.isStar ? 'star' : 'base')].totalWithDeductions)" />
                            </li>
                        </template>
                    </ul>
                </div>
                <div v-if="harvester.settings.includeReplantCost && (cropInfo.isStar === parseCropId(cycleId).isStar)"
                    class="bg-primary dark:bg-palia-blue rounded-sm p-2">
                    <div class="h-full flex flex-col justify-between">
                        <p class="text-xs font-bold">Average deduction
                        </p>
                        <div class="flex flex-col">
                            <p class="text-xs">Day {{
                                selectedCropCycleData.phases.at(-1)!.dayOfHarvest }}
                            </p>
                            <ItemDisplay class="max-w-12 dark:border dark:border-water-retain" :imgSrc="selectedCropAsCrop?.image"
                                :imgAlt="selectedCropAsCrop?.type" :star="cropInfo.isStar"
                                :count="(selectedCropCycleData.phases.at(-1)!.yield[(cropInfo.isStar ? 'star' : 'base')].totalWithDeductions - selectedCropCycleData.phases.at(-1)!.yield[(cropInfo.isStar ? 'star' : 'base')].totalRaw)" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Processing Info -->
        <section v-if="selectedCropProcessingData && selectedCropProcessingData.cycleData.length > 0"
            class="p-2 bg-accent dark:bg-palia-blue-dark rounded-md flex flex-col gap-1">
            <h3 class="text-sm font-semibold text-palia-blue-dark dark:text-accent">Processing Info</h3>
            <div>
                <p v-if="!canFinishBeforeNextHarvest" class="text-neutral font-semibold text-xs dark:text-warning">
                    <font-awesome-icon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
                    Harvests can't process before next harvest
                </p>
            </div>
            <div class="grid grid-cols-2 grid-rows-2 gap-1 text-sm xl:grid-cols-3">
                <div class="flex gap-1 p-2 bg-primary dark:bg-palia-blue rounded-xs justify-between flex-col">
                    <p class="text-palia-blue font-semibold text-xs dark:text-accent dark:opacity-90">Average Produce /
                        Cycle
                    </p>

                    <ItemDisplay class="max-w-10"
                        :imgSrc="selectedCropAsCrop![`${selectedCropIsProcessedAs === ItemType.Preserve ? 'preserveImage' : 'seedImage'}`]"
                        :imgAlt="`${selectedCropAsCrop!.type} ${selectedCropIsProcessedAs}`"
                        :count="selectedCropProcessingData.averageProduce" />
                </div>
                <!-- <div class="flex gap-1 py-1 border border-palia-blue px-2 justify-between rounded-xs">
                    <p class="text-palia-blue opacity-80 text-xs dark:text-accent dark:opacity-90">Gold Generated</p>
                    <div class="font-bold flex items-center gap-1">
                        <img width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
                            format="webp">
                        <p>{{
                            Math.round(selectedCropProcessingData.averageGoldGenerated).toLocaleString()
                        }}</p>
                    </div>
                </div> -->
                <div class="flex gap-1 p-2 bg-primary dark:bg-palia-blue rounded-xs justify-between flex-col">
                    <p class="text-palia-blue font-semibold text-xs dark:text-accent">Absolute Processing Time</p>
                    <p class="font-bold text-base"> <font-awesome-icon :icon="['fas', 'stopwatch']" /> {{
                        formatMinutesToDaysHoursMinutes(selectedCropProcessingData.totalProcessMinutes) }}</p>
                </div>
                <div class="flex gap-1 p-2 bg-primary dark:bg-palia-blue rounded-xs justify-between flex-col">
                    <p class="text-palia-blue font-semibold text-xs dark:text-accent">Average Cycle
                        Processing Time
                    </p>
                    <p class="font-bold text-base"> <font-awesome-icon :icon="['fas', 'stopwatch']" /> {{
                        formatMinutesToDaysHoursMinutes(selectedCropProcessingData.averageProcessMinutes)
                        }}</p>
                </div>
                <div class="flex gap-1 p-2 bg-primary dark:bg-palia-blue rounded-xs justify-between flex-col">
                    <p class="text-palia-blue font-semibold text-xs dark:text-accent">Estimated Time to
                        Process
                        Everything</p>
                    <p class="font-bold text-base"> <font-awesome-icon :icon="['fas', 'stopwatch']" /> {{
                        formatMinutesToDaysHoursMinutes(selectedCropProcessingData.effectiveProcessMinutes) }}</p>
                </div>
            </div>
        </section>
        <section
            v-else-if="selectedCropProcessingData === null || selectedCropProcessingData.cycleData[0].cycleCrafterData === undefined"
            class="p-2 border rounded-sm ">
            <p class="text-sm py-2 text-misc-dark dark:text-primary">
                No Process Data
            </p>
        </section>
    </section>
</template>
