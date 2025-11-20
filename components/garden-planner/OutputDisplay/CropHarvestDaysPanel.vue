<script setup lang="ts">
import { type ICropNameWithGrowthDiff, type IDayHarvest } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import type { PropType } from 'vue'
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
    // return props.shouldBeMaxSize ? 376 : 376
    return 376
})

const selectedTab = ref<'harvests' | 'details'>('harvests')
</script>

<template>
    <section class="h-full flex flex-col rounded-sm">
        <div class="flex justify-between items-center mb-2">
            <p class="dark:text-accent font-bold text-sm">Harvest Days</p>
            <!-- <div class="join">
                <button class="btn btn-xs rounded-sm join-item">List View</button>
                <button class="btn btn-xs rounded-sm join-item">Day View</button>
            </div> -->
        </div>
        <div
            class="bg-accent border border-misc dark:bg-palia-blue-secondary dark:border-water-retain/60 p-2 rounded-sm">
            <div v-if="selectedTab === 'harvests'" class="" v-bind="containerProps" :style="{ height: `${size}px` }">
                <div v-bind="wrapperProps" class="">
                    <InventoryRow v-for="item in list" :key="item.data.day" :day-harvest="item.data"
                        :crop-to-filter-for="cropToFilter" />
                </div>
            </div>
        </div>
    </section>
</template>