<script setup lang="ts">
import type { ICropNameWithGrowthDiff } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import type { PropType } from 'vue'
import InventoryRow from './InventoryRow.vue'
import CropHarvestDayDetail from './CropHarvestDayDetail.vue'

const harvester = useHarvester()
// const processor = useProcessor()
const uiSettings = useUiSettings()

const props = defineProps({
    cropToFilter: {
        type: String as PropType<ICropNameWithGrowthDiff>,
        required: false,
        default: null
    },
    shouldBeMaxSize: {
        type: Boolean,
        default: false
    }
})

const listArr = computed(() => {
    const filteredArray = Array.from(harvester.harvester.dayHarvests.values())

    return filteredArray
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
    return 368
})

const selectedTab = ref<'harvests' | 'details'>('harvests')

// const asProcessedItems = ref(false)
const selectedDay = ref<number | null>(null)

watchEffect(() => {
    const firstAvailableDay = harvester.harvester.dayHarvests.size > 0 ? harvester.harvester.dayHarvests.keys().next().value! : null

    if (listArr.value.length !== 0 &&
        (selectedDay.value === null || !harvester.harvester.dayHarvests.has(selectedDay.value!))) {
        selectedDay.value = firstAvailableDay
    }

    // If the selected day is not available anymore, switch back to harvests tab
    if (selectedDay.value !== null && !harvester.harvester.dayHarvests.has(selectedDay.value)) {
        selectedTab.value = 'harvests'
        selectedDay.value = firstAvailableDay
    }
})

function nextDay() {
    if (harvester.harvester.dayHarvests.size <= 0 || selectedDay.value === null) return

    const keys = Array.from(harvester.harvester.dayHarvests.keys())
    const currentDayIndex = keys.indexOf(selectedDay.value)
    const nextDayIndex = (currentDayIndex !== (keys.length - 1) ? (currentDayIndex + 1) : 0)

    selectedDay.value = keys[nextDayIndex] || null
}
function previousDay() {
    if (harvester.harvester.dayHarvests.size <= 0 || selectedDay.value === null) return

    const keys = Array.from(harvester.harvester.dayHarvests.keys())
    const currentDayIndex = keys.indexOf(selectedDay.value)
    const nextDayIndex = (currentDayIndex !== 0 ? (currentDayIndex - 1) : (keys.length - 1))

    selectedDay.value = keys[nextDayIndex] || null
}

// const dropdownRef = ref<HTMLElement>()
</script>

<template>
    <section class="h-full flex flex-col rounded-sm">
        <div class="flex justify-between items-center mb-0.5">
            <p class="dark:text-accent font-bold text-sm">Harvest Days</p>
            <div class="dropdown dropdown-end p-0">
                <div tabindex="0" role="button" class="btn btn-xs">Options<font-awesome-icon
class="text-lg"
                        icon="cog" /></div>
                <div
tabindex="-1"
                    class="dropdown-content bg-palia-blue text-accent flex flex-col rounded-box z-1 p-2 shadow-sm min-w-xs w-fit mt-1 gap-2 max-w-xs sm:max-w-xl">

                    <fieldset class="fieldset bg-base-200 p-2 rounded-sm">
                        <legend class="legend text-accent">Preview as processed</legend>

                        <label class="label">
                            <input v-model="uiSettings.settings.showAsProcessedItems" type="checkbox" class="toggle" >
                            <span class="label-text"/>
                        </label>
                        <p class="label font-light whitespace-break-spaces">Show the eventual output of the crops
                            harvested on that day.</p>

                        <p class="label items-start font-light pb-1 whitespace-break-spaces text-info">
                            <font-awesome-icon class="text-xs text-info" icon="info" />This does not mean the crops
                            finished processing on that day, just the eventual value of that harvest.
                        </p>
                    </fieldset>
                    <fieldset
                        :class="`fieldset bg-base-200 p-2 rounded-sm ${uiSettings.settings.showAsProcessedItems ? '' : 'opacity-50'}`">
                        <legend class="legend text-accent">Additional Previews</legend>


                        <p class="label font-light whitespace-break-spaces">Show potential gold value.</p>
                        <label class="label">
                            <input
v-model="uiSettings.settings.showAsProcessedGold" type="checkbox"
                                :disabled="!uiSettings.settings.showAsProcessedItems" class="toggle" >
                            <span class="label-text"/>
                        </label>
                        <p class="label font-light whitespace-break-spaces pt-2">Show estimated processing time</p>
                        <label class="label">
                            <input
v-model="uiSettings.settings.showAsProcessedTime" type="checkbox"
                                :disabled="!uiSettings.settings.showAsProcessedItems" class="toggle" >
                            <span class="label-text"/>
                        </label>
                    </fieldset>

                    <!-- <fieldset class="fieldset bg-base-200 p-2 rounded-sm">
                        <legend class="legend">View Type</legend>
                        <div class="tabs tabs-border tabs-sm join px-0">
                            <button
                                :class="`tab join-item ${selectedTab === 'harvests' ? 'tab-active text-accent' : ''}`"
                                @click="selectedTab = 'harvests'">List View</button>
                            <button
                                :class="`tab join-item ${selectedTab === 'details' ? 'tab-active text-accent' : ''}`"
                                @click="selectedTab = 'details'">Day View</button>
                        </div>
                        <p class="label font-light">List View: Show all the harvests in one view</p>
                        <p class="label font-light">Day View: Shows detailed info for a specific day</p>
                    </fieldset> -->
                </div>
            </div>
        </div>
        <div
            class="bg-accent border border-misc dark:bg-palia-blue-secondary dark:border-water-retain/60 p-1 rounded-sm">
            <div v-if="selectedTab === 'harvests'" class="" v-bind="containerProps" :style="{ height: `${size}px` }">
                <div v-bind="wrapperProps" class="">
                    <InventoryRow
v-for="item in list" :key="item.data.day" :day-harvest="item.data"
                        :crop-to-filter-for="cropToFilter" @day-clicked="(day: number) => {
                            selectedDay = day
                            selectedTab = 'details'
                        }" />
                </div>
            </div>
            <div v-else-if="selectedTab === 'details' && selectedDay !== null" class="">
                <CropHarvestDayDetail
:day="selectedDay"
                    :day-harvest="harvester.harvester.dayHarvests.get(selectedDay)!"
                    :prev-available="harvester.harvester.dayHarvests.size > 0"
                    :next-available="harvester.harvester.dayHarvests.size > 0"
                    @return-click="() => { selectedTab = 'harvests' }" @next="() => nextDay()"
                    @prev="() => previousDay()" />
            </div>
        </div>
    </section>
</template>