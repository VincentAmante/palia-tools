<script setup lang="ts">
import useGardenGrid from '~/stores/useGardenGrid';
import GridTile from '~/components/garden-planner/GridTile.vue';
import { saveSettings } from '~/assets/scripts/garden-planner/save-handler';


const isTakingScreenshot = useTakingScreenshot()
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
    <section
id="garden-display" class="flex flex-col items-start px-1 h-full pb-4 sm:pb-0 sm:px-0 overflow-y-auto rounded-sm" :class="[
        ((isTakingScreenshot.get && gardenGrid.isGardenWide) || isTakingScreenshot.get) ? 'max-w-none! w-full! border border-misc dark:border-water-retain' : '',
        (gardenGrid.isGardenWide) ? 'overflow-x-scroll max-w-210 lg:max-w-235 xl:max-w-7xl bg-misc/10 xl:p-2 xl:px-2 dark:bg-palia-blue-secondary scrollbar scrollbar-h-2 pb-1 scrollbar-thumb-rounded-xl dark:scrollbar-thumb-accent scrollbar-thumb-palia-blue max-h-165' : 'max-w-full w-full max-h-300',
    ]"
    aria-label="Garden Display"
        >
        <table id="garden-grid" class="table-auto" aria-label="Garden Grid">
        <thead v-if="useUiSettings().settings.showGridAxesLabels">
            <tr class="pb-0.5">
                <th />
                <th
v-for="x in gardenGrid.grid.width" :key="`column-${x}`" scope="col"
                    class="text-xs text-palia-blue dark:text-water-retain">{{ x - 1 }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="y in gardenGrid.grid.height" :key="`row-${y - 1}`" :aria-label="`row-${y - 1}`">
                <th  v-if="useUiSettings().settings.showGridAxesLabels" scope="row" class="text-palia-blue dark:text-water-retain pr-1 text-xs">{{ y - 1 }}</th>
                <td v-for="x in gardenGrid.grid.width" :key="`cell-${x - 1},${y - 1}`">
                    <GridTile :coordinates="`${x - 1},${y - 1}`" @update="() => { handleUpdate() }" />
                </td>
            </tr>
        </tbody>
        </table>
    </section>
</template>