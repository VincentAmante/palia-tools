<script setup lang="ts">
import useHarvester from '~/stores/useHarvester'
import useGarden from '~/stores/useGarden'
import CropDetailsHarvestDisplay from './CropDetailsHarvestDisplay.vue'
import CropDetailsGardenFertiliserTables from './CropDetailsGardenFertiliserTables.vue'
import CropDetailsGardenSeedTables from './CropDetailsGardenSeedTables.vue'
const harvester = useHarvester()
const garden = useGarden()

const tab = ref<'Harvest' | 'Tending' | 'Misc'>('Harvest')

const plotStat = computed(() => garden.plotStat)

</script>

<template>
    <div class="flex gap-1 flex-row  py-1 gap-x-4 items-center pb-2">
        <h3
            class="text-sm font-semibold w-fit text-palia-blue-dark text-center p-0.5 flex gap-1 items-center bg-accent dark:bg-palia-blue-light dark:text-accent px-3 rounded-sm">
            All Harvests
        </h3>

        <nav role="tablist" class="tabs tabs-xs tabs-border bg-palia-blue-dark rounded-sm gap-1 w-fit">
            <button role="tab" class="tab join-item" :class="(tab === 'Harvest') ? 'tab-active text-accent' : ''"
                @click="tab = 'Harvest'" :aria-selected="tab === 'Harvest'">
                <p>Harvest</p>
            </button>
            <!-- <button role="tab" class="tab join-item" :class="(tab === 'Tending') ? 'tab-active text-accent' : ''"
                    @click="tab = 'Tending'" :aria-selected="tab === 'Tending'">
                    <p>Tending</p>
                </button> -->
            <button role="tab" class="tab join-item" :class="(tab === 'Misc') ? 'tab-active text-accent' : ''"
                @click="tab = 'Misc'" :aria-selected="tab === 'Misc'">
                <p>Misc</p>
            </button>
        </nav>
    </div>
    <CropDetailsHarvestDisplay v-if="tab === 'Harvest'" should-be-max-size
        :day-harvests="harvester.harvester.dayHarvests" />
    <div v-if="tab === 'Misc'">
        <section class="bg-accent border-misc-dark rounded-sm border overflow-y-auto max-h-102">
            <table
                class="table table-sm table-pin-rows [&_tr]:not-last:border-b [&_tr]:even:bg-secondary/80 [&_] [&_th]:whitespace-break-spaces [&_tr]:border-b-misc">

                <CropDetailsGardenSeedTables />
                <CropDetailsGardenFertiliserTables />

            </table>
        </section>
    </div>
</template>