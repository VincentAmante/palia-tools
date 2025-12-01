<script setup lang="ts">
import type { PropType } from 'vue';
import { type IDetailedProcessingInfo } from '~/assets/scripts/garden-planner/classes/processor';

const props = defineProps({
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

watchEffect(() => {
    if (props.selectedCropProcessingData!.cycleData[cropDetailCycleIndex.value].cycleCrafterData.length <= cropDetailCyclePhaseIndex.value) {
        cropDetailCycleIndex.value = 0;
        cropDetailCyclePhaseIndex.value = 0;
    }
});
</script>

<template>
    <div v-if="selectedCropProcessingData && selectedCropDetail" class="grid gap-1  dark:text-accent rounded-sm">
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
            <section class="flex flex-row gap-2 items-start">
                <h3 class="text-sm font-bold">Harvest</h3>
                <div class="join">
                    <button
                        v-for="phaseIndex in selectedCropProcessingData!.cycleData[cropDetailCycleIndex].cycleCrafterData.length"
                        @click="cropDetailCyclePhaseIndex = (phaseIndex - 1)" class="join-item btn btn-soft btn-xs px-4"
                        :class="{ 'btn-active': (phaseIndex - 1) === cropDetailCyclePhaseIndex }"
                        :aria-label="`Phase ${phaseIndex}`">
                        {{ phaseIndex }}</button>
                </div>
            </section>
        </div>
        <div class="max-h-72 overflow-y-scroll overflow-x-auto border-transparent">
            <table class="table table-sm table-pin-rows dark:bg-palia-blue-light rounded-lg">
                <thead class="">
                    <tr class="font-light text-accent border dark:border-water-retain dark:bg-palia-blue-dark">
                        <th class="text-wrap justify-center">
                            Crafter
                        </th>
                        <th class="text-wrap">
                            Crops Inserted
                        </th>
                        <th class="text-wrap justify-center">
                            Processes Done
                        </th>
                        <th class="text-wrap justify-center">
                            Processing Time
                        </th>
                        <th class="text-wrap justify-center">
                            +Idle / >Excess
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(crafter, crafterIndex) in selectedCropProcessingData.cycleData[cropDetailCycleIndex].cycleCrafterData[cropDetailCyclePhaseIndex].crafterData"
                        class="bg-accent border-misc dark:border-water-retain dark:bg-palia-blue border last:rounded-b-lg"
                        :key="`${cropDetailCycleIndex}-${selectedCropDetail}-${crafterIndex}`">
                        <th class="text-sm">
                            {{ crafterIndex + 1 }}
                        </th>
                        <td class="text-end bg-secondary dark:bg-palia-blue-secondary">
                            {{ crafter.cropsInsertedCount.toLocaleString() }}
                        </td>
                        <td class="text-end">
                            {{ crafter.processesDone.toLocaleString(undefined, { maximumFractionDigits: 1 }) }}
                        </td>
                        <td class="text-end bg-secondary dark:bg-palia-blue-secondary">
                            {{ formatMinutesToHoursMinutes(crafter.processTimeMinutes) }}
                        </td>
                        <td class="text-end">
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
