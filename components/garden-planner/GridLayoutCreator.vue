<script setup lang="ts">
import type PGPModal from '@/components/PGPModal.vue'

import { GardenGrid } from '~/assets/scripts/garden-planner/classes/gardenGrid';
import { getCodeFromCrop } from '~/assets/scripts/garden-planner/cropList';
import { CropType } from '~/assets/scripts/garden-planner/imports';
import GridLayoutCreatorTile from './GridLayoutCreatorTile.vue';


const gardenGrid = useGardenGrid()
const gardenCopy = useLayoutCreatorGrid()
const settingsCode = useSettingsCode()

const MIN_ROWS = 3
const MAX_ROWS = 81

const MIN_COLS = 3
const MAX_COLS = 81


const widthInTiles = computed({
    get: () => gardenCopy.grid.width,
    set: (newWidth) => {
        let widthToSet = newWidth

        if (widthToSet < MIN_ROWS) widthToSet = MIN_ROWS
        if (widthToSet > MAX_ROWS) widthToSet = MAX_ROWS

        gardenCopy.changeWidth(widthToSet)
    }
})
const rawWidth = ref(widthInTiles.value)
const debouncedSetWidth = useDebounceFn((newWidth) => {
    widthInTiles.value = newWidth
}, 500)
watch(widthInTiles, (newWidth) => {
    rawWidth.value = newWidth
})
watch(rawWidth, (newWidth) => {
    debouncedSetWidth(newWidth)
})

const heightInTiles = computed({
    get: () => gardenCopy.grid.height,
    set: (newHeight) => {
        let heightToSet = newHeight

        if (heightToSet < MIN_ROWS) heightToSet = MIN_ROWS
        if (heightToSet > MAX_ROWS) heightToSet = MAX_ROWS

        gardenCopy.changeHeight(heightToSet)
    }
})
const rawHeight = ref(heightInTiles.value)
const debouncedSetHeight = useDebounceFn((newHeight) => {
    heightInTiles.value = newHeight
}, 500)
watch(heightInTiles, (newHeight) => {
    rawHeight.value = newHeight
})
watch(rawHeight, (newHeight) => {
    debouncedSetHeight(newHeight)
})

const isPlotLimitsRaised = computed({
    get: () => gardenCopy.isPlotLimitsRaised,
    set: (toggleTo) => gardenCopy.togglePlotLimits(toggleTo)
})

function onModalClose() {

}

function onModalOpen() {
    const newGardenCopyCode = gardenGrid.grid.saveGarden(settingsCode.code)
    gardenCopy.setGarden(newGardenCopyCode)
}



const modal = ref<InstanceType<typeof PGPModal> | null>(null)
function openModal() {
    onModalOpen()
    modal.value?.showModal()
}
defineExpose({
    openModal,
})


function handleConfirmEdit() {
    gardenCopy.trimGarden()
    const newGardenCode = gardenCopy.saveGarden(settingsCode.code)
    gardenGrid.loadGardenByCode(newGardenCode)
    modal.value?.hideModal()
}

const gardenLink = computed(() => {
    return gardenCopy.saveGarden(settingsCode.code)
})

const presetCodes = [
    {
        title: 'Select Preset',
        code: null
    },
    {
        title: '1x2',
        code: '3x6_CR-0x0N9-0x3N9'
    },
    {
        title: '2x1',
        code: '6x3_CR-0x0N9-3x0N9'
    },
    {
        title: '2x2',
        code: '6x6_CR-0x0N9-3x0N9-0x3N9-3x3N9'
    },
    {
        title: '2x3',
        code: '6x9_CR-0x0N9-3x0N9-0x3N9-3x3N9-0x6N9-3x6N9'
    },
    {
        title: '3x2',
        code: '9x6_CR-0x0N9-3x0N9-6x0N9-0x3N9-3x3N9-6x3N9'
    },

    {
        title: '3x3',
        code: '9x9_CR-0x0N9-3x0N9-6x0N9-0x3N9-3x3N9-6x3N9-0x6N9-3x6N9-6x6N9'
    },
    {
        title: 'Custom',
        code: '12x12_CR'
    }
]

const selectedCode = ref<string | null>(null)

function handlePresetCodesSelection() {
    if (!selectedCode.value) return

    const dimCode = `D-${selectedCode.value}`
    const versionCode = 'v0.5'
    const string = [versionCode, dimCode, settingsCode.code].join('_')

    gardenCopy.setGarden(string)
}

const plotCount = computed(() => gardenCopy.grid.plotCount)
</script>

<template>
    <PGPModal ref="modal" use-full-height>
        <template #header>
            Edit Plots
        </template>
        <template #body>
            <div class="flex flex-col gap-1 rounded-md">
                <div class="flex flex-col gap-1 bg-palia-blue-dark rounded-md p-2">
                    <h3>
                        Dimensions
                    </h3>

                    <fieldset class="fieldset w-full">
                        <legend class="fieldset-legend">Presets</legend>
                        <select v-model="selectedCode" class="select" @change="handlePresetCodesSelection">
                            <option v-for="code in presetCodes" :key="code.title" :value="code.code" :disabled="!code">
                                {{ code.title }}
                            </option>
                        </select>
                        <p class="label flex flex-col whitespace-break-spaces items-start">
                            <span>
                                Pick a pre-determined size here, or make a custom one.
                            </span>
                            <span class="text-warning">
                                <font-awesome-icon class="" :icon="['fas', 'triangle-exclamation']" />
                                Will delete all crops if preset/custom is selected. Consider saving first
                            </span>
                        </p>
                    </fieldset>

                    <div class="flex gap-2">
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Rows</legend>
                            <div class="join">
                                <button
:disabled="(heightInTiles <= MIN_ROWS)"
                                    class="join-item btn btn-sm btn-square border-palia-blue-light bg-palia-blue-light hover:bg-palia-blue-dark text-xl font-bold"
                                    @click="() => {
                                        if (heightInTiles > MIN_ROWS) heightInTiles--
                                    }">-</button>
                                <input
v-model.number="rawHeight" :min="MIN_ROWS" :max="MAX_ROWS"
                                    class="input input-sm join-item max-w-16" type="number">

                                <button
:disabled="(heightInTiles >= MAX_ROWS)"
                                    class="join-item btn btn-sm btn-square border-palia-blue-light bg-palia-blue-light hover:bg-palia-blue-dark text-xl font-bold"
                                    @click="() => {
                                        if (heightInTiles < MAX_ROWS) heightInTiles++
                                    }">+</button>
                            </div>
                        </fieldset>

                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Columns</legend>
                            <div class="join">
                                <button
:disabled="(widthInTiles <= MIN_COLS)"
                                    class="join-item btn btn-sm btn-square border-palia-blue-light bg-palia-blue-light hover:bg-palia-blue-dark text-xl font-bold"
                                    @click="() => {
                                        if (widthInTiles > MIN_COLS) widthInTiles--
                                    }">-</button>

                                <input
v-model.number="rawWidth" :min="MIN_COLS" :max="MAX_COLS"
                                    class="input join-item input-sm max-w-16" type="number">

                                <button
:disabled="(widthInTiles >= MAX_COLS)"
                                    class="join-item btn btn-sm btn-square border-palia-blue-light bg-palia-blue-light hover:bg-palia-blue-dark text-xl font-bold"
                                    @click="() => {
                                        if (widthInTiles < MAX_COLS) widthInTiles++
                                    }">+</button>
                            </div>
                        </fieldset>
                    </div>
                    <div>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend" :class="plotCount > 9 ? 'text-warning' : ''">
                                <span><font-awesome-icon icon="leaf" />
                                    Soil Plots</span><span>({{
                                        plotCount }} of <span>{{
                                        gardenCopy.isPlotLimitsRaised ? '27' : '9' }}</span>)</span>
                                <font-awesome-icon
v-if="plotCount > 9" class="text-warning"
                                    :icon="['fas', 'triangle-exclamation']" />
                            </legend>
                            <span v-if="plotCount > 9" class="text-warning text-xxs"> The game only supports 9 plots as
                                of writing, for experimental purposes you may go up to 27</span>
                        </fieldset>
                    </div>
                </div>
                <div
                    class="gap-1 bg-palia-blue-dark rounded-md p-2 pr-4 pb-4 max-h-90 overflow-y-auto overflow-x-auto  scrollbar-h-2">
                    <table>
                        <tbody>
                            <tr v-for="row in heightInTiles" :key="`row-${row}`">
                                <td v-for="cell in widthInTiles" :key="`cell-${cell - 1},${row - 1}`" class="">
                                    <GridLayoutCreatorTile :coordinates="`${cell - 1},${row - 1}`" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="text-xs">
                    <p>Empty rows/columns on the edges will be trimmed</p>
                </div>
                <div class="flex flex-col lg:flex-row gap-1  rounded-md">
                    <button class="btn" @click="handleConfirmEdit">
                        Confirm Layout
                    </button>
                    <a class="btn" :href="`?layout=${gardenLink}`" target="_blank">
                        <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="" />
                        Confirm Layout in New Tab
                    </a>
                </div>
            </div>
        </template>
    </PGPModal>
</template>