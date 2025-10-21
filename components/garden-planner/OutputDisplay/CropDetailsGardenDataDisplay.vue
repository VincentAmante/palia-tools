<script setup lang="ts">
import useHarvester from '~/stores/useHarvester'
import CropDetailsHarvestDisplay from './CropDetailsHarvestDisplay.vue'
const harvester = useHarvester()


</script>

<template>
    <div class="flex gap-1 flex-row  py-1 gap-x-4 items-center">
        <h3
            class="text-sm font-semibold w-fit text-palia-blue-dark text-center p-0.5 flex gap-1 items-center bg-accent dark:bg-palia-blue-light dark:text-accent px-3 rounded-sm">
            All Harvests
        </h3>
    </div>
    <CropDetailsHarvestDisplay should-be-max-size :day-harvests="harvester.harvester.dayHarvests" />
</template>