<script setup lang="ts">
import useGardenGrid from '~/stores/useGardenGrid';
import ItemSelector from '~/components/garden-planner/ItemSelector/ItemSelector.vue';
import GridTile from '~/components/garden-planner/GridTile.vue';
import MenuBar from '~/components/garden-planner/MenuBar.vue'
import GridLayoutCreator from '~/components/garden-planner/GridLayoutCreator.vue';
import ObjectViewer from '~/components/ObjectViewer.vue';
import OutputDisplay from '~/components/garden-planner/OutputDisplay.vue';
import StatsDisplay from '~/components/garden-planner/StatsDisplay.vue';
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


watchEffect(() => {
    const settingsSaveString = saveSettings(harvester.settings, processor.settings)
    settingsCode.set(settingsSaveString)
    handleUpdate()
})

watchEffect(() => {
    harvester.harvester.simulateYield(gardenGrid.analyser.uniqueTiles, harvester.settings)
})

watchEffect(() => {
    processor.simulateProcessing(harvester.totalHarvest)
})

function tryLoad() {
    console.log('attempting to load')
    gardenGrid.loadGardenByCode(loadCode.value.trim())
}

const loadCode = ref('')

const toggleObjectView = ref(true)

const toggleLayoutEditor = ref(false)

const gridLayoutCreator = ref<InstanceType<typeof GridLayoutCreator> | null>(null)
</script>

<template>
    <main class="w-full px-12">
        <section class="bg-accent dark:bg-palia-blue-dark px-2">

            <section>
                <OutputDisplay />
            </section>
            <p class="bg-palia-blue">Settings: {{ useSettingsCode().code }}</p>
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
            <StatsDisplay />
            <section class="flex flex-col gap-1 bg-palia-blue">
                <p>{{ saveCode }}</p>
                <textarea v-model="loadCode" class="textarea" />
                <div class="grid grid-cols-2 w-fit gap-2 p-1 pt-4">
                    <button class="btn" @click="tryLoad">
                        Try Load
                    </button>
                    <button class="btn" @click="() => gardenGrid.trimGarden()">
                        Trim Layout
                    </button>
                </div>
            </section>
            <MenuBar />
        </section>



        <section class="flex flex-col gap-1">
            <button class="btn" @click="() => gridLayoutCreator?.openModal()">Toggle Layout Editor</button>
            <GridLayoutCreator ref="gridLayoutCreator" />
        </section>
        <section class="flex flex-col gap-1 bg-palia-blue-dark">

            <button class="btn" @click="() => toggleObjectView = !toggleObjectView">
                Toggle Obj View
            </button>
            <DevOnly>
                <ObjectViewer v-if="toggleObjectView" :value="gardenGrid.analyser" />
            </DevOnly>
        </section>
    </main>
</template>