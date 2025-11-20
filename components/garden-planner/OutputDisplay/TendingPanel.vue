<script setup lang="ts">

import useHarvester from '~/stores/useHarvester'
import useGarden from '~/stores/useGarden'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
const harvester = useHarvester()
const garden = useGarden()

const plotStat = computed(() => garden.plotStat)

const cropsToWaterDaily = computed(() => {
    return plotStat.value.cropCount - plotStat.value.cropBonusCoverage['Water Retain']
});

const cropsToCheckForWeedDaily = computed(() => {
    return plotStat.value.cropCount - plotStat.value.cropBonusCoverage['Weed Prevention']
})

function getBgStyle(cropsHarvested: number) {
    if (cropsHarvested <= 0)
        return 'bg-secondary dark:bg-palia-blue'
    else if (cropsHarvested <= 1)
        return 'bg-harvest-boost/10 dark:bg-harvest-boost-dark/10'
    else if (cropsHarvested <= 2)
        return 'bg-harvest-boost/20 dark:bg-harvest-boost-dark/20'
    else if (cropsHarvested <= 3)
        return 'bg-harvest-boost/30 dark:bg-harvest-boost-dark/30'
    else if (cropsHarvested <= 4)
        return 'bg-harvest-boost/40 dark:bg-harvest-boost-dark/40'
    else if (cropsHarvested <= 5)
        return 'bg-harvest-boost/50 dark:bg-harvest-boost-dark/50'
    else if (cropsHarvested <= 6)
        return 'bg-harvest-boost/60 dark:bg-harvest-boost-dark/60'
    else if (cropsHarvested <= 7)
        return 'bg-harvest-boost/70 dark:bg-harvest-boost-dark/70'
    else if (cropsHarvested <= 8)
        return 'bg-harvest-boost/80 dark:bg-harvest-boost-dark/80'
    else if (cropsHarvested <= 9)
        return 'bg-harvest-boost/90 dark:bg-harvest-boost-dark/90'
    else
        return 'bg-harvest-boost'
}

function getTextStyle(cropsHarvested: number) {
    if (cropsHarvested <= 2)
        return 'text-harvest-boost-dark dark:text-harvest-boost'
    else if (cropsHarvested < 4)
        return 'text-harvest-boost-dark dark:text-harvest-boost'
    else if (cropsHarvested < 8)
        return 'text-harvest-boost-dark dark:text-harvest-boost'
    else
        return 'text-harvest-boost-dark dark:text-harvest-boost'

}

const harvestChart = computed(() => {
    const dayData: {
        day: number;
        isHarvestDay: boolean;
        bgStyle: string;
        textStyle: string;
    }[] = []

    for (let i = 0; i < harvester.totalHarvest.lastHarvestDay; i++) {
        const dayHarvest = harvester.harvester.dayHarvests.get(i + 1)
        dayData.push({
            day: i + 1,
            isHarvestDay: dayHarvest ? true : false,
            bgStyle: dayHarvest ? getBgStyle(dayHarvest.cropsHarvested.size) : 'bg-secondary dark:bg-palia-blue',
            textStyle: dayHarvest ? getTextStyle(dayHarvest.cropsHarvested.size) : ''
        })
    }

    return dayData
})
</script>
<template>
    <section class="text-sm rounded-sm flex flex-col gap-1 dark:text-accent">
        <h2 class="font-bold">Tending Activity<span class="font-normal text-xs"> &mdash; How often you have to check on
                your
                crops</span></h2>
        <section class="bg-accent p-1 rounded-sm dark:bg-palia-blue-dark"
            v-if="(cropsToWaterDaily > 0) || (cropsToCheckForWeedDaily > 0)">
            <p class="text-sm font-bold pb-1">Daily Maintenance</p>
            <ul class="flex gap-1">
                <li v-if="cropsToWaterDaily > 0"
                    class="p-2 bg-accent/40 border-water-retain border px-3 rounded-sm w-fit dark:bg-palia-blue-light/40">
                    <p class="flex items-center gap-1">
                        <FontAwesomeIcon :icon="['fas', 'droplet']" class="text-water-retain w-4" />
                        <span class="font-semibold">{{ cropsToWaterDaily }}</span>
                        {{ cropsToWaterDaily !== 1 ? "crops need" : 'crop needs' }} watering
                    </p>
                </li>

                <li v-if="cropsToCheckForWeedDaily > 0"
                    class="p-2 bg-accent/40 border-weed-prevention border px-3 rounded-sm w-fit dark:bg-palia-blue-light/40">
                    <p class="flex items-center gap-1">
                        <FontAwesomeIcon :icon="['fas', 'eye']" class="text-weed-prevention w-4" /><span
                            class="font-semibold">
                            {{ cropsToCheckForWeedDaily }}
                        </span> {{ cropsToCheckForWeedDaily !== 1 ? 'crops need' : 'crop needs' }} to be checked
                        for weed
                    </p>
                </li>
            </ul>
        </section>
        <section v-if="harvestChart.length > 0"
            class="bg-accent p-1 gap-0.5 flex flex-col rounded-sm dark:bg-palia-blue-dark">
            <h3 class="font-semibold">Harvest Calendar <span class="font-normal text-xs"> &mdash; Palian days spent
                    harvesting</span></h3>
            <p class="text-xs">
                <FontAwesomeIcon :icon="['fas', 'wheat-awn']" class="text-harvest-boost-dark dark:text-harvest-boost" />
                &#xFF1D; Harvest Day |

                <span>
                    {{ Math.round((harvester.harvester.dayHarvests.size / harvester.totalHarvest.lastHarvestDay) * 100)
                    }}% of Palian Days/Growth Ticks ({{ harvester.harvester.dayHarvests.size }} Days of {{
                        harvester.totalHarvest.lastHarvestDay }})
                </span>
            </p>
            <div
                class="flex flex-wrap max-h-50 overflow-y-auto border border-collapse border-misc rounded-sm p-1 pb-2 bg-misc/20 dark:bg-palia-blue-dark/60 dark:border-water-retain/60">
                <template v-for="day in harvestChart">
                    <div
                        :class="`first:rounded-tl-sm last:rounded-br-sm w-6 h-6 border border-collapse -mr-px -mb-px relative border-harvest-boost-dark flex items-center justify-center ${day.bgStyle}`">
                        <template v-if="day.isHarvestDay">
                            <FontAwesomeIcon :icon="['fas', 'wheat-awn']" :class="`${day.textStyle} w-4`"
                                :title="`Day ${day.day} - Harvest Day`" />
                        </template>
                    </div>
                </template>
            </div>

            <h3 class="font-semibold text-xs pt-1">Days between harvests</h3>
            <ul class="flex gap-1">
                <li
                    class="flex gap-3 items-center flex-wrap p-0.5 bg-secondary px-2 rounded-sm border border-misc dark:bg-palia-blue-secondary dark:border-water-retain/60">
                    <p class="text-xs">Longest</p>
                    <p class="text-sm font-semibold">{{ harvester.harvester.harvestDayGaps.highest }}</p>
                </li>

                <li
                    class="flex gap-3 items-center flex-wrap p-0.5 bg-secondary px-2 rounded-sm border border-misc dark:bg-palia-blue-secondary dark:border-water-retain/60">
                    <p class="text-xs">Shortest</p>
                    <p class="text-sm font-semibold">{{ harvester.harvester.harvestDayGaps.lowest }}</p>
                </li>

                <li
                    class="flex gap-3 items-center flex-wrap p-0.5 bg-secondary px-2 rounded-sm border border-misc dark:bg-palia-blue-secondary dark:border-water-retain/60">
                    <p class="text-xs">Average</p>
                    <p class="text-sm font-semibold">{{ Math.round(harvester.harvester.harvestDayGaps.average *
                        100) / 100 }}</p>
                </li>
            </ul>
        </section>
        <!-- <section>
            <p>Processing</p>
        </section> -->
    </section>
</template>