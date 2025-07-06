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
    <section v-if="selectedCropDetail && selectedCropCycleData" class="py-1 flex flex-col gap-1 dark:text-accent">
        <!-- Cycle Info -->
        <section class="p-2 border rounded-sm border-misc-dark bg-accent dark:bg-palia-blue-light dark:border-palia-blue-dark">
            <div class="flex flex-col gap-1">
                <div class="flex flex-wrap gap-1 text-sm">
                    <p class="font-semibold badge badge-sm">{{ selectedCropCycleData.phases.length }}<span
                            class="">Harvest<template
                                v-if="selectedCropCycleData.phases.length > 1">s</template></span>/ {{
                                    selectedCropCycleDuration }} Days
                    </p>
                    <p class="font-semibold badge badge-sm">{{ selectedCropTotalFullCycles }} Cycle<template
                            v-if="selectedCropTotalFullCycles > 1">s</template></p>
                    <p v-if="selectedCropTotalFullCycles !== selectedCropCycleData.totalHarvestsCount"
                        class="font-semibold badge badge-sm">
                        {{ selectedCropCycleData.totalHarvestsCount }} Total Harvests</p>
                    <p class="font-semibold badge badge-sm"
                        v-if="selectedCropSeedsRequiredPerHarvest && (cropInfo.isStar === parseCropId(cycleId).isStar)">
                        <span class="font-semibold">Seeds per Replant:</span>&nbsp;{{
                            selectedCropSeedsRequiredPerHarvest.count }}
                    </p>
                    <p class="font-semibold badge badge-sm" v-else>
                        <span class="font-semibold">Seeds per Replant:</span>&nbsp;N/A
                    </p>
                    <p v-if="(selectedCropSeedsRequiredPerHarvest?.count || 0) !== selectedCropTotalSeedsRequired && (cropInfo.isStar === parseCropId(cycleId).isStar)"
                        class="font-semibold badge badge-sm"><span class="font-semibold">Total Seeds
                            Used:</span>&nbsp;{{
                                selectedCropTotalSeedsRequired }}</p>
                </div>
                <div>
                    <p class="text-sm pb-1">Harvest days/cycle</p>
                    <ul class="flex flex-wrap gap-2">
                        <template v-for="harvestYield in selectedCropCycleData.phases">
                            <li class="flex flex-col">
                                <p class="text-xs">Day {{ harvestYield.dayOfHarvest }}</p>
                                <ItemDisplay class="max-w-12" :imgSrc="selectedCropAsCrop?.image"
                                    :imgAlt="selectedCropAsCrop?.type" :star="cropInfo.isStar"
                                    :count="(harvestYield.yield[(cropInfo.isStar ? 'star' : 'base')].totalWithDeductions)" />
                            </li>
                        </template>
                        <li class="flex flex-col md:pl-4 md:border-l-2 border-l-misc"
                            v-if="harvester.settings.includeReplantCost && (cropInfo.isStar === parseCropId(cycleId).isStar)">
                            <p class="text-xs">Average deduction (Day {{
                                selectedCropCycleData.phases.at(-1)!.dayOfHarvest }})
                            </p>
                            <ItemDisplay class="max-w-12" :imgSrc="selectedCropAsCrop?.image"
                                :imgAlt="selectedCropAsCrop?.type" :star="cropInfo.isStar"
                                :count="(selectedCropCycleData.phases.at(-1)!.yield[(cropInfo.isStar ? 'star' : 'base')].totalWithDeductions - selectedCropCycleData.phases.at(-1)!.yield[(cropInfo.isStar ? 'star' : 'base')].totalRaw)" />
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        <!-- Processing Info -->
        <section v-if="selectedCropProcessingData && selectedCropProcessingData.cycleData.length > 0"
            class="flex flex-col gap-2 p-2 border rounded-sm border-misc-dark bg-accent dark:bg-palia-blue-light dark:border-palia-blue-dark">
            <div>
                <p v-if="!canFinishBeforeNextHarvest" class="text-neutral font-semibold text-xs dark:text-warning">
                    <font-awesome-icon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
                    Harvests can't process before next harvest
                </p>
            </div>
            <div class="grid grid-cols-2 flex-wrap gap-1 gap-y-2 text-sm xl:grid-cols-3 pb-4">
                <div class="flex flex-col gap-1 py-1 border border-palia-blue px-1 rounded-xs justify-between">
                    <p class="text-palia-blue opacity-80 text-xs dark:text-accent dark:opacity-90">Average Produce/Cycle:</p>
                    <ItemDisplay class="max-w-12"
                        :imgSrc="selectedCropAsCrop![`${selectedCropIsProcessedAs === ItemType.Preserve ? 'preserveImage' : 'seedImage'}`]"
                        :imgAlt="`${selectedCropAsCrop!.type} ${selectedCropIsProcessedAs}`"
                        :count="selectedCropProcessingData.averageProduce" />
                </div>
                <div class="flex flex-col gap-1 py-1 border border-palia-blue px-2 justify-between rounded-xs">
                    <p class="text-palia-blue opacity-80 text-xs dark:text-accent dark:opacity-90">Gold Generated</p>
                    <div class="font-bold text-lg flex items-center gap-1">
                        <img width="16" height="16" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
                            format="webp">
                        <p>{{
                            Math.round(selectedCropProcessingData.averageGoldGenerated).toLocaleString()
                        }}</p>
                    </div>
                </div>
                <div class="flex flex-col gap-1 py-1 border border-palia-blue px-2 rounded-xs justify-between">
                    <p class="text-palia-blue opacity-80 text-xs dark:text-accent dark:opacity-90">Total Active Processing Minutes</p>
                    <p class="font-bold text-lg"> <font-awesome-icon :icon="['fas', 'stopwatch']" /> {{
                        formatMinutesToDaysHoursMinutes(selectedCropProcessingData.totalProcessMinutes) }}</p>
                </div>
                <div class="flex flex-col gap-1 py-1 border border-palia-blue px-2 rounded-xs justify-between">
                    <p class="text-palia-blue opacity-80 text-xs dark:text-accent dark:opacity-90">Average Cycle Processing Time</p>
                    <p class="font-bold text-lg"> <font-awesome-icon :icon="['fas', 'stopwatch']" /> {{
                        formatMinutesToDaysHoursMinutes(selectedCropProcessingData.averageProcessMinutes)
                    }}</p>
                </div>
                <div class="flex flex-col gap-1 py-1 border border-palia-blue px-2 rounded-xs justify-between">
                    <p class="text-palia-blue opacity-80 text-xs dark:text-accent dark:opacity-90">Estimated Time to Process Everything</p>
                    <p class="font-bold text-lg"> <font-awesome-icon :icon="['fas', 'stopwatch']" /> {{
                        formatMinutesToDaysHoursMinutes(selectedCropProcessingData.effectiveProcessMinutes) }}</p>
                </div>
            </div>
        </section>
        <section
            v-else-if="selectedCropProcessingData === null || selectedCropProcessingData.cycleData[0].cycleCrafterData === undefined"
            class="p-2 border rounded-sm border-misc-dark bg-accent dark:bg-palia-blue-light dark:border-palia-blue-dark">
            <p class="text-sm py-2 text-misc-dark dark:text-primary">
                No Process Data
            </p>
        </section>
    </section>
</template>
