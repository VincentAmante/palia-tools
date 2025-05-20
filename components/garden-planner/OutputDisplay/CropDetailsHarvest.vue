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
    console.log(props.dayHarvests)
    console.log(Object.values(props.dayHarvests))

    return Array.from(props.dayHarvests.values())
})

const listFiltered = computed(() => {
    const cropToFilter = props.cropToFilter
    let filteredList = listArr.value

    console.log(listArr.value)
    if (cropToFilter) {
        console.log('toFilter', cropToFilter)
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
</script>

<template>
    <section class="h-full">
        <h3 class="text-sm font-semibold">Harvests</h3>
        <div class="bg-secondary p-2 rounded-sm border border-misc" v-bind="containerProps" :style="{height: `${size}px`}">
            <div v-bind="wrapperProps" class="">
                <InventoryRow v-for="item in list" :key="item.data.day" :day-harvest="item.data" :crop-to-filter-for="cropToFilter" />
            </div>
        </div>
    </section>
</template>