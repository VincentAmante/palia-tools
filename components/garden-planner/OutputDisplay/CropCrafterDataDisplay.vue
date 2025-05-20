<script setup lang="ts">
import type { PropType } from 'vue';
import { type IDetailedProcessingInfo } from '~/assets/scripts/garden-planner/classes/processor';

defineProps({
    selectedCropProcessingData: {
        type: Object as PropType<IDetailedProcessingInfo>,
        required: true
    },
    selectedCropDetail: {
        type: String,
        required: true
    }
})

const cropDetailCycleIndex = ref(0);
const cropDetailCyclePhaseIndex = ref(0);
</script>

<template>
    <div v-if="selectedCropProcessingData && selectedCropDetail" class="grid gap-1">
        <div class="flex justify-between">
            <!-- <div class="flex flex-col">
                <p class="text-sm">Cycle</p>
                <div v-if="cropDetailsProcessTab === 'cycle-data'" class="join">
                  <button class="join-item btn" @click="() => {
                    if (cropDetailCycleIndex <= 0)
                      return

                    cropDetailCycleIndex--
                  }">«</button>
                  <button class="join-item btn">Cycle {{ cropDetailCycleIndex + 1 }}</button>
                  <button class="join-item btn" @click="() => {
                    if (cropDetailCycleIndex >= (selectedCropProcessingData!.cycleData.length - 1))
                      return

                    else
                      cropDetailCycleIndex++
                  }">»</button>
                </div>
              </div> -->
            <div class="flex flex-row gap-2 items-center">
                <p class="text-sm font-bold">Harvest</p>
                <div class="join">
                    <button
                        v-for="phaseIndex in selectedCropProcessingData!.cycleData[cropDetailCycleIndex].cycleCrafterData.length"
                        @click="cropDetailCyclePhaseIndex = (phaseIndex - 1)" class="join-item btn btn-soft btn-sm"
                        :class="{ 'btn-active': (phaseIndex - 1) === cropDetailCyclePhaseIndex }" :aria-label="`Phase ${phaseIndex}`">{{ phaseIndex
                        }}</button>
                </div>
            </div>
        </div>
        <div class="max-h-48 overflow-y-scroll overflow-x-auto ">
            <table class="table bg-primary table-sm table-pin-rows">
                <thead>
                    <tr class="font-light text-accent">
                        <th class="">
                            Crafter #
                        </th>
                        <th class="">
                            Crops Added
                        </th>
                        <th class="">
                            Processes
                        </th>
                        <th class="">
                            Time
                        </th>
                        <th class="">
                            +Idle / >Excess
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(crafter, crafterIndex) in selectedCropProcessingData.cycleData[cropDetailCycleIndex].cycleCrafterData[cropDetailCyclePhaseIndex].crafterData"
                        :key="`${cropDetailCycleIndex}-${selectedCropDetail}-${crafterIndex}`">
                        <td class="">
                            {{ crafterIndex + 1 }}
                        </td>
                        <td class="">
                            {{ crafter.cropsInsertedCount.toLocaleString() }}
                        </td>
                        <td class="">
                            {{ crafter.processesDone.toLocaleString(undefined, { maximumFractionDigits: 1 }) }}
                        </td>
                        <td class="">
                            {{ formatMinutesToHoursMinutes(crafter.processTimeMinutes) }}
                        </td>
                        <td class="">
                            <template v-if="crafter.excessTimeMinutes > 0">
                                <span class="italic">
                                    &gt;{{ formatMinutesToHoursMinutes(crafter.excessTimeMinutes) }}</span>
                            </template>
                            <template v-else="crafter.idleTimeMinutes > 0">
                                +{{ formatMinutesToHoursMinutes(crafter.idleTimeMinutes) }}
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
