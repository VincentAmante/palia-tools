<script setup lang="ts">
import useHarvester from '~/stores/useHarvester'
import CropDetailsHarvestDisplay from './CropDetailsHarvestDisplay.vue'
const harvester = useHarvester()

const tab = ref<'Harvest' | 'Tending' | 'Misc'>('Harvest')
</script>

<template>
    <div class="flex gap-1 flex-row  py-1 gap-x-4 items-center pb-2">
        <h3
            class="text-sm font-semibold w-fit text-palia-blue-dark text-center p-0.5 flex gap-1 items-center bg-accent dark:bg-palia-blue-light dark:text-accent px-3 rounded-sm">
            All Harvests
        </h3>

        <div>
            <nav role="tablist" class="font-semibold tabs tabs-box w-fit join">
                <button role="tab" class="tab join-item" :class="(tab === 'Harvest') ? 'tab-active' : ''"
                    @click="tab = 'Harvest'" :aria-selected="tab === 'Harvest'">
                    <p>Harvest</p>
                </button>
                <!-- <button role="tab" class="tab join-item" :class="(tab === 'Tending') ? 'tab-active' : ''"
                    @click="tab = 'Tending'" :aria-selected="tab === 'Tending'">
                    <p>Tending</p>
                </button> -->
                <button role="tab" class="tab join-item" :class="(tab === 'Misc') ? 'tab-active' : ''"
                    @click="tab = 'Misc'" :aria-selected="tab === 'Misc'">
                    <p>Misc</p>
                </button>
            </nav>
        </div>
    </div>
    <CropDetailsHarvestDisplay v-if="tab === 'Harvest'" should-be-max-size
        :day-harvests="harvester.harvester.dayHarvests" />
</template>