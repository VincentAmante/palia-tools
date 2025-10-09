<script setup lang="ts">
import ItemDisplay from '~/components/garden-planner/HarvestCalculator/ItemDisplay.vue'
import useProcessor from '~/stores/useProcessor'
import { type ICropNameWithGrowthDiff, type IDayHarvest, type IDayHarvests } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import type { Prop, PropType } from 'vue'
import { CropItem, type Item } from '~/assets/scripts/garden-planner/classes/items/item'
import InventoryRow from './InventoryRow.vue'


const props = defineProps({
    dayHarvests: {
        type: Map as PropType<Map<number, IDayHarvest>>,
        required: true
    },
    cropToFilter: {
        type: String as PropType<ICropNameWithGrowthDiff>,
        required: false,
    },
    shouldBeMaxSize: {
        type: Boolean,
        default: false
    }
})

const listArr = computed(() => {
    return Array.from(props.dayHarvests.values())
})

const listFiltered = computed(() => {
    const cropToFilter = props.cropToFilter
    let filteredList = listArr.value

    if (cropToFilter) {
        filteredList = listArr.value.filter((dayHarvest) => {
            return dayHarvest.crops.has(cropToFilter)
        })
    }

    return filteredList
})

const { list, containerProps, wrapperProps } = useVirtualList(listFiltered, {
    itemHeight: 69.6
})

const size = computed(() => {
    return props.shouldBeMaxSize ? 368 : 338
})

const selectedTab = ref<'harvests' | 'details'>('harvests')
</script>

<template>
    <section class="h-full flex flex-col gap-1">
        <div v-if="!cropToFilter" class="flex gap-1 flex-row  py-1 gap-x-4 items-center">
            <h3
                class="text-sm font-semibold w-fit text-palia-blue-dark text-center p-0.5 flex gap-1 items-center bg-accent dark:bg-palia-blue-light dark:text-accent px-3 rounded-sm">
                All Harvests
            </h3>
            <!-- <h3 class="text-sm font-semibold dark:text-accent">Harvests</h3> -->
             <p v-if="listArr.length > 0" class="text-xs font-semibold dark:text-accent">
                {{ listArr.length }} Harvests / {{ listArr[listArr.length - 1].day }} Growth Ticks - {{ Math.round((listArr.length / listArr[listArr.length - 1].day) * 100) }}% Days Spent Harvesting
             </p>
        </div>

        <div v-if="selectedTab === 'harvests'"
            class="bg-accent p-2 rounded-sm border border-misc dark:bg-palia-blue dark:border-palia-blue-light"
            v-bind="containerProps" :style="{ height: `${size}px` }">
            <div v-bind="wrapperProps" class="">
                <InventoryRow v-for="item in list" :key="item.data.day" :day-harvest="item.data"
                    :crop-to-filter-for="cropToFilter" />
            </div>
        </div>
    </section>
</template>