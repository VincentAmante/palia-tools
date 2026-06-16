<script setup lang="ts">
import useGardenGrid from '~/stores/useGardenGrid';
import GridTile from '~/components/garden-planner/GridTile.vue';
import { saveSettings } from '~/assets/scripts/garden-planner/save-handler';

const gardenGrid = useGardenGrid()
const harvester = useHarvester()
const processor = useProcessor()
const settingsCode = useSettingsCode()

useHead({
    title: 'Palia Dev Page'
})

const saveCode = ref(gardenGrid.saveGarden(settingsCode.code))


const handleUpdate = useDebounceFn(() => {
    saveCode.value = gardenGrid.saveGarden(settingsCode.code)
    gardenGrid.updateStats()
}, 50, { maxWait: 100 })

</script>

<template>
    <section id="garden-display" class="flex flex-col items-center h-full">
        <table id="gardenGrid" class="table-auto" aria-label="Garden Grid">
            <thead>
                <tr class="pb-0.5">
                    <th/>
                    <th
v-for="x in gardenGrid.grid.width" :key="`column-${x}`" scope="col"
                        class="text-xs text-misc dark:text-water-retain">{{ x - 1 }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="y in gardenGrid.grid.height" :key="`row-${y - 1}`" :aria-label="`row-${y - 1}`">
                    <th scope="row" class="text-misc dark:text-water-retain pr-1 text-xs">{{ y - 1 }}</th>
                    <td v-for="x in gardenGrid.grid.width" :key="`cell-${x - 1},${y - 1}`">
                        <GridTile :coordinates="`${x - 1},${y - 1}`" @update="() => { handleUpdate() }" />
                    </td>
                </tr>
            </tbody>
        </table>
    </section>
</template>