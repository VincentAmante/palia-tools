<script setup lang="ts">
import type PGPModal from '@/components/PGPModal.vue'

import { GardenGrid } from '~/assets/scripts/garden-planner/classes/gardenGrid';
import { getCodeFromCrop } from '~/assets/scripts/garden-planner/cropList';
import { CropType } from '~/assets/scripts/garden-planner/imports';
import GridLayoutCreatorTile from './GridLayoutCreatorTile.vue';


const gardenGrid = useGardenGrid()
const gardenCopy = useLayoutCreatorGrid()
const settingsCode = useSettingsCode()


const widthInTiles = ref(9)
const heightInTiles = ref(9)

watchEffect(() => {
    
})

watchEffect(() => {
    widthInTiles.value = gardenCopy.grid.width
    heightInTiles.value = gardenCopy.grid.height
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
</script>

<template>
    <PGPModal ref="modal">
        <template #header> 
            Edit Layout
        </template>
        <template #body>
            <div class="bg-palia-blue-dark mt-2 p-2">
                <h3>
                    Dimensions
                </h3>

                <table>
                    <tbody>
                        <tr v-for="row in heightInTiles" :key="`row-${row}`">
                            <td v-for="cell in widthInTiles" :key="`cell-${cell - 1},${row - 1}`" class="">
                                <!-- <button class="btn bg-palia-blue aspect-square w-full max-w-8 h-8">
                                    <span v-if="gardenCopy.getTile(`${cell - 1},${row - 1}`)?.attachedCrop">
                                        {{ getCodeFromCrop(gardenCopy.getTile(`${cell - 1},${row -
                                            1}`)!.attachedCrop!.crop)
                                        }}
                                    </span>
                                </button> -->
                                <GridLayoutCreatorTile :coordinates="`${cell - 1},${row - 1}`" />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div>
                    <p>Row</p>
                    <input v-model="widthInTiles" class="input" type="number">
                    <p>Column</p>
                    <input v-model="heightInTiles" class="input" type="number">
                </div>

                <div class="flex flex-col gap-2 pt-4">
                    <select v-model="selectedCode" class="select" @change="handlePresetCodesSelection">
                        <option v-for="code in presetCodes" :key="code.title" :value="code.code" :disabled="!code">
                            {{ code.title }}
                        </option>
                    </select>
                </div>

                <button class="btn btn-success" @click="handleConfirmEdit">
                    Confirm Edit
                </button>
            </div>
        </template>
    </PGPModal>
</template>