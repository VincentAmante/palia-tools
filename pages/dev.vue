<script setup lang="ts">
import useGardenGrid from '~/stores/useGardenGrid';
import ItemSelector from '~/components/garden-planner/ItemSelector/ItemSelector.vue';
import GridTile from '~/components/garden-planner/GridTile.vue';
import MenuBar from '~/components/garden-planner/MenuBar.vue'
import { validateNewPlotFormat } from '~/assets/scripts/garden-planner/save-handler';
import { GardenGridBasic } from '~/assets/scripts/garden-planner/saveHandlerGardenBasic';
import { GardenGrid } from '~/assets/scripts/garden-planner/classes/gardenGrid';
import GridLayoutCreator from '~/components/garden-planner/GridLayoutCreator.vue';

const gardenGrid = useGardenGrid()

useHead({
    title: 'Palia Dev Page'
})

const saveCode = ref(gardenGrid.grid.fetchGardenCode())

const handleUpdate = useDebounceFn(() => {
    saveCode.value = gardenGrid.grid.fetchGardenCode()
}, 50, { maxWait: 100 })

function parseSave() {
    const [dimInfo, cropInfo] = saveCode.value.split('_')
    validateNewPlotFormat(dimInfo || '', cropInfo || '')
}

function tryLoad() {
    console.log('attempting to load')
    gardenGrid.loadGardenByCode(loadCode.value)
}

const loadCode = ref('')
</script>

<template>
    <main class="w-full px-12">
        <section class="bg-accent dark:bg-palia-blue-dark px-2">

            <ItemSelector />
            <table id="gardenGrid" class="" aria-label="Garden Grid">
                <tbody>
                    <tr v-for="y in gardenGrid.grid.height" :key="`row-${y}`">
                        <td v-for="x in gardenGrid.grid.width" :key="`cell-${x},${y}`">
                            <!-- <div class="w-16 h-16 border border-palia-blue-dark items-center justify-center p-1">
                            <p><span>{{ grid.grid.getTile(`${x - 1},${y - 1}`)?.coordinates }}</span></p>
                        </div> -->
                            <GridTile :coordinates="`${x - 1},${y - 1}`" @update="() => { handleUpdate() }" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <p>{{ saveCode }}</p>

            <textarea v-model="loadCode" class="textarea" />
            <button class="btn" @click="tryLoad">
                Try Load
            </button>
            <button class="btn" @click="parseSave">
                Attempt parse
            </button>
            <button class="btn" @click="() => gardenGrid.grid.trimPlots()">
                Trim Layout
            </button>
            <MenuBar />
        </section>

        <GridLayoutCreator />
    </main>
</template>