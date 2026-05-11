<script lang="ts" setup>
import { type ICropNameWithGrowthDiff, ItemType, parseCropId, type IDayHarvest } from '~/assets/scripts/garden-planner/utils/garden-helpers';

import { CropItem, type Item } from '~/assets/scripts/garden-planner/classes/items/item'
import ItemDisplayAlt from '../HarvestCalculator/ItemDisplayAlt.vue'
import { formatMinutesToDaysHoursMinutes } from '~/utils/formatters'
import { getCropFromType } from '~/assets/scripts/garden-planner/imports';


const processor = useProcessor()
const harvester = useHarvester()
const uiSettings = useUiSettings()
const plannerDisplayConfig = usePlannerDisplayConfig()
const props = defineProps({
    day: {
        type: Number,
        required: true
    },
    dayHarvest: {
        type: Object as PropType<IDayHarvest>,
        required: true
    },
    prevAvailable: {
        type: Boolean,
        required: false
    },
    nextAvailable: {
        type: Boolean,
        required: false
    }
})

const itemsProcessed = computed(() => {
    return processor.processor.processSingleDay(props.dayHarvest!, processor.settings, harvester.harvester.totalHarvest.cycleData)
})

const items = computed(() => {
    const itemsList = [] as Item[]

    if (uiSettings.settings.showAsProcessedItems) {
        for (const [, item] of itemsProcessed.value.inventory) {
            itemsList.push(CropItem.fromInventoryItem(item))
        }
    } else {
        for (const [cropId, crop] of props.dayHarvest.crops) {
            itemsList.push(CropItem.fromCropYieldAndInfo(cropId, crop))
        }
    }

    return itemsList
})

const craftersUsed = computed(() => {
    const seedCollectors: Item[] = []
    const preserveJars: Item[] = []
    const byCropId = new Map<ICropNameWithGrowthDiff, {
        type: 'Preserve Jar' | 'Seed Collector' | 'Preserve Jars' | 'Seed Collectors',
        count: number
    }>()

    for (const [name, count] of itemsProcessed.value.stats.craftersUsed.seedCollectors) {
        const { type, isStar } = parseCropId(name)
        const crop = getCropFromType(type)!

        const seedCollectorItem = CropItem.fromInventoryItem({
            count: count,
            img: {
                src: crop.image,
                alt: type,
            },
            isStar,
            baseGoldValue: 0,
            itemType: ItemType.Crop,
            cropType: type,
        })

        seedCollectors.push(seedCollectorItem)
        byCropId.set(name, {
            type: count !== 1 ? 'Seed Collectors' : 'Seed Collector',
            count: count
        })
    }

    for (const [name, count] of itemsProcessed.value.stats.craftersUsed.preserveJars) {
        const { type, isStar } = parseCropId(name)
        const crop = getCropFromType(type)!

        const preserveJarItem = CropItem.fromInventoryItem({
            count: count,
            img: {
                src: crop.image,
                alt: type,
            },
            isStar,
            baseGoldValue: 0,
            itemType: ItemType.Crop,
            cropType: type,
        })

        preserveJars.push(preserveJarItem)
        byCropId.set(name, {
            type: count !== 1 ? 'Preserve Jars' : 'Preserve Jar',
            count: count
        })
    }

    return {
        seedCollectors,
        preserveJars,
        byCropId
    }
})

const totalGold = computed(() => {
    if (itemsProcessed.value.stats.goldGenerated > 0) {
        return itemsProcessed.value.stats.goldGenerated
    } else {
        return items.value.reduce((acc, item) => {
            return acc + item.totalGoldValue
        }, 0)
    }
})

const activeTab = ref<'default' | 'cropProcessTimes'>('default')
</script>
<template>
    <section class="text-sm flex flex-col p-0 gap-1 dark:text-accent">
        <nav class="grid grid-cols-3 gap-1 pb-1">
            <div>
                <button class="btn btn-xs btn-ghost dark:text-accent" @click="$emit('returnClick')"> <font-awesome-icon
                        :icon="['fas', 'arrow-left']" class="" />Return to list</button>
            </div>
            <div class="flex justify-center items-center gap-2">
                <button
class="btn btn-xs btn-circle btn-ghost" aria-label="Previous Day" :disabled="!prevAvailable"
                    @click="$emit('prev')"><font-awesome-icon :icon="['fas', 'chevron-left']" class="" /></button>
                <h3 class="font-bold text-center">Day {{ day }}</h3>
                <button
class="btn btn-xs btn-circle btn-ghost" :disabled="!nextAvailable" aria-label="Previous Day"
                    @click="$emit('next')"><font-awesome-icon :icon="['fas', 'chevron-right']" class="" /></button>
            </div>
            <div class="bg-primary invisible" />
        </nav>
        <div v-if="activeTab === 'default'" class="bg-secondary dark:bg-palia-blue-dark p-2 rounded-md">
            <section>
                <h3 class="font-semibold text-xs">Estimated Harvests <span
                        v-if="uiSettings.settings.showAsProcessedItems">(Previewing as processed)</span></h3>
                <ul
class="flex w-full overflow-x-auto gap-1 p-1 scrollbar-h-2 max-w-118 bg-opacity-50 rounded-md bg-misc-dark/20  dark:bg-palia-blue-dark join-item"
                    :class="[plannerDisplayConfig.get === 'display+display' ? 'xl:max-w-152 ' : 'xl:max-w-180']">
                    <template v-for="item of items" :key="item.name">
                        <ItemDisplayAlt
v-if="item.count !== 0" class="border-misc border" :img-src="item.image"
                            :img-alt="item.name" :star="item.isStar" :count="item.count"
                            :base-gold-value="item.price" />
                    </template>
                </ul>
            </section>
            <section class="pt-2">
                <div class="flex gap-2 justify-between items-center pb-1">
                    <h4 class="text-xs font-semibold">Process Stats</h4>

                    <button
aria-label="See More" class="btn btn-xs w-fit"
                        @click="activeTab = 'cropProcessTimes'"><font-awesome-icon :icon="['fas', 'eye']" />View by
                        crop</button>
                </div>
                <!-- <p v-if="!itemsProcessed.stats.canFinishBeforeNextHarvest"
                class="text-neutral font-semibold text-xs dark:text-warning">
                <font-awesome-icon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
                A crop's harvest can't finish before its next one
            </p> -->
                <div class="grid grid-cols-3 gap-1">
                    <div class="flex gap-1 p-2 bg-misc/20 dark:bg-palia-blue rounded-xs justify-between flex-col">
                        <p class=" font-semibold text-xs">{{ (itemsProcessed.stats.longestProcessMinutes > 0 ?
                            "Potential Gold Value" : 'Gold Value') }}</p>
                        <p class="font-bold text-base gap-0.5"> <img
width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4 inline"
                                :srcset="undefined" alt="Gold" format="webp"> {{
                                    Math.round(totalGold).toLocaleString()
                                }}</p>
                    </div>
                    <div class="flex gap-1 p-2 bg-misc/20 dark:bg-palia-blue rounded-xs justify-between flex-col">
                        <p class=" font-semibold text-xs">Estimated time to process this harvest</p>
                        <div class="flex justify-between">
                            <p class="font-bold text-base gap-0.5"> <font-awesome-icon :icon="['fas', 'stopwatch']" />
                                {{
                                    formatMinutesToDaysHoursMinutes(itemsProcessed.stats.longestProcessMinutes) }}</p>
                        </div>
                    </div>
                    <div class="flex gap-1 p-2 bg-misc/20 dark:bg-palia-blue rounded-xs justify-between flex-col">
                        <p class=" font-semibold text-xs">Gold Generated / Hour Processing</p>
                        <p class="font-bold text-base gap-0.5"> <img
width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4 inline"
                                :srcset="undefined" alt="Gold" format="webp"> {{
                                    Math.round((itemsProcessed.stats.goldGenerated /
                                        (itemsProcessed.stats.longestProcessMinutes / 60)) || 0).toLocaleString() }}</p>
                    </div>
                </div>
            </section>
            <section class="pt-3">
                <h4 class="text-xs font-semibold">Crafters Assigned</h4>
                <div class="grid grid-cols-2 gap-2 pt-1">
                    <div class="flex flex-col w-full">
                        <div class="flex items-end">
                            <img
src="https://pgp-cdn.b-cdn.net/seeder.webp" class="max-w-5" alt="Seed Collectors"
                                aria-hidden="true">
                            <p class="px-1 text-xs font-semibold text-palia-blue-dark dark:text-accent">
                                Seed Collectors
                                <span v-if="itemsProcessed.stats.craftersUsed.seedCollectorsCount > 0">- {{
                                    itemsProcessed.stats.craftersUsed.seedCollectorsCount }}</span>
                            </p>
                        </div>
                        <ul
                            class="flex w-full overflow-x-auto gap-1 p-0.75 scrollbar-h-2 min-h-12 bg-opacity-50 rounded-md bg-misc-dark/10  dark:bg-palia-blue-dark/10 border border-misc dark:border-water-retain">
                            <template v-for="item of craftersUsed.seedCollectors" :key="item.name">
                                <ItemDisplayAlt
v-if="item.count !== 0" class="border-misc border" :img-src="item.image"
                                    :img-alt="item.name" :star="item.isStar" :count="item.count"
                                    :base-gold-value="item.price" />
                            </template>
                        </ul>
                    </div>
                    <div class="flex flex-col w-full">
                        <div class="flex items-end">
                            <img
src="https://pgp-cdn.b-cdn.net/preserve-jar.webp" class="max-w-5" alt="Preserve Jars"
                                aria-hidden="true">
                            <p class="px-1 text-xs font-semibold text-palia-blue-dark dark:text-accent">
                                Preserve Jars
                                <span v-if="itemsProcessed.stats.craftersUsed.preserveJarsCount > 0">- {{
                                    itemsProcessed.stats.craftersUsed.preserveJarsCount }}</span>
                            </p>
                        </div>
                        <ul
                            class="flex w-full overflow-x-auto gap-1 p-0.75 scrollbar-h-2 min-h-12 bg-opacity-50 rounded-md bg-misc-dark/10  dark:bg-palia-blue-dark/10 border border-misc dark:border-water-retain">
                            <template v-for="item of craftersUsed.preserveJars" :key="item.name">
                                <ItemDisplayAlt
v-if="item.count !== 0" class="border-misc border" :img-src="item.image"
                                    :img-alt="item.name" :star="item.isStar" :count="item.count"
                                    :base-gold-value="item.price" />
                            </template>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
        <div v-if="activeTab === 'cropProcessTimes'" class="flex flex-col gap-1">
            <div class="bg-misc rounded-md w-fit">
                <button class="btn btn-xs" @click="activeTab = 'default'"><font-awesome-icon
                        :icon="['fas', 'chevron-left']" class="" />
                    Back to day overview</button>
            </div>
            <div class=" overflow-y-auto max-h-78 border dark:bg-palia-blue-light rounded-lg dark:border-water-retain">
                <table class="table table-sm table-pin-rows ">
                    <thead class=" text-accent">
                        <tr class="dark:bg-palia-blue-dark border-b-palia-blue">
                            <th>Crop</th>
                            <th class="whitespace-break-spaces">Potential Gold Value</th>
                            <th class="whitespace-break-spaces">Distributed Process Time</th>
                            <th class="whitespace-break-spaces">Gold / Hour Processing</th>
                        </tr>
                        <tr class="dark:bg-palia-blue-dark text-xxs h-fit">
                            <th class="py-0" />
                            <th class="py-0 whitespace-break-spaces" />
                            <th class="py-0 pb-0.5 whitespace-break-spaces">No Idle Time</th>
                            <th class="py-0 whitespace-break-spaces" />
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                        v-for="[cropId, processingInfo] in itemsProcessed.output.detailedProcessingInfo"
                        :key="cropId"
                            class=" not-last:border-b border-misc dark:border-water-retain [&>td]:nth-[2n]:bg-secondary [&>td]:nth-[2n]:dark:bg-palia-blue">

                            <td class="capitalize">
                                <p>
                                    <font-awesome-icon
v-if="parseCropId(cropId).isStar" :icon="['fas', 'star']"
                                        class="text-quality-increase-dark dark:text-quality-increase" />
                                    <font-awesome-icon
v-if="parseCropId(cropId).hasGrowthBoost"
                                        :icon="['fas', 'fast-forward']"
                                        class=" text-growth-boost dark:text-growth-boost" />
                                    {{ parseCropId(cropId).type }}
                                </p>
                            </td>

                            <td class="">
                                <p>
                                    <img
width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp"
                                        class="max-h-4 inline" :srcset="undefined" alt="Gold" format="webp">
                                    {{ formatToOneDecimal(processingInfo.totalGoldGenerated).toLocaleString() }}
                                </p>
                            </td>
                            <td class="">
                                <p>
                                    <font-awesome-icon :icon="['fas', 'stopwatch']" />
                                    {{ formatMinutesToDaysHoursMinutes(processingInfo.effectiveProcessMinutes) }}
                                    <span v-if="craftersUsed.byCropId.get(cropId)" class="text-xxs">({{
                                        `${craftersUsed.byCropId.get(cropId)!.count}
                                        ${craftersUsed.byCropId.get(cropId)!.type}`
                                    }})</span>
                                </p>
                            </td>
                            <td class="">
                                <p>

                                    <img
width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp"
                                        class="max-h-4 inline" :srcset="undefined" alt="Gold" format="webp">
                                    {{ formatToOneDecimal((processingInfo.totalGoldGenerated /
                                        (processingInfo.totalProcessMinutes /
                                            60))).toLocaleString() }}
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</template>