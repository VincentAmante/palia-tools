<script setup lang="ts">
import useHarvester from '~/stores/useHarvester'
// import useGarden from '~/stores/useGarden'
import CropDetailsHarvestDisplay from './CropHarvestDaysPanel.vue'
import GardenFertiliserTables from './GardenFertiliserTables.vue'
import GardenSeedTables from './GardenSeedTables.vue'
import TendingPanel from './TendingPanel.vue'
const harvester = useHarvester()

const tab = ref<'Harvest' | 'Tending' | 'Misc'>('Harvest')

</script>

<template>
    <div class="flex gap-1 flex-row  py-1 gap-x-4 items-center pb-2">
        <h3
            class="text-sm font-semibold w-fit text-palia-blue-dark text-center p-0.5 flex gap-1 items-center bg-accent dark:bg-palia-blue-light dark:text-accent px-3 rounded-sm">
            All Harvests
        </h3>

        <nav role="tablist" class="tabs tabs-xs tabs-border bg-palia-blue-dark rounded-sm gap-1 w-fit">
            <button 
            role="tab" class="tab join-item" :class="(tab === 'Harvest') ? 'tab-active text-accent' : ''"
                :aria-selected="tab === 'Harvest'" @click="tab = 'Harvest'">
                <p>Harvest</p>
            </button>
            <button
            role="tab" class="tab join-item" :class="(tab === 'Tending') ? 'tab-active text-accent' : ''"
                :aria-selected="tab === 'Tending'" @click="tab = 'Tending'">
                <p>Tending</p>
            </button>
            <button
            role="tab" class="tab join-item" :class="(tab === 'Misc') ? 'tab-active text-accent' : ''"
                :aria-selected="tab === 'Misc'" @click="tab = 'Misc'">
                <p>Misc</p>
            </button>
        </nav>
    </div>
    <CropDetailsHarvestDisplay
v-if="tab === 'Harvest'" should-be-max-size
        :day-harvests="harvester.harvester.dayHarvests" />
    <div v-if="tab === 'Misc'">
        <section
            class="bg-accent dark:bg-palia-blue dark:text-accent border-misc-dark dark:border-palia-blue-dark rounded-sm border overflow-y-auto max-h-102">
            <table
                class="table table-sm table-pin-rows [&_tr]:even:bg-secondary/50  [&_] [&_th]:whitespace-break-spaces dark:[&_tr]:even:bg-palia-blue-light/60">

                <GardenFertiliserTables />
                <GardenSeedTables />
            </table>
        </section>
    </div>
    <div v-if="tab === 'Tending'">
        <TendingPanel />
    </div>
</template>