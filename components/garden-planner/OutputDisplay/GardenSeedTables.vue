<script setup lang="ts">
import useHarvester from '~/stores/useHarvester'
import useGarden from '~/stores/useGarden'
import { parseCropId } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import { CropType, getCropFromType } from '~/assets/scripts/garden-planner/imports'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
const harvester = useHarvester()
const garden = useGarden()

const plotStat = computed(() => garden.plotStat)
const cycleData = computed(() => harvester.harvester.totalHarvest.cycleData)

const lastGrowthTick = computed(() => harvester.harvester.totalHarvest.lastHarvestDay)

function formatToOneDecimal(num: number) {
    return (parseFloat(num.toFixed(1)));
}


const totalSeedCounts = computed(() => {
    const seedCountsTracker: Map<CropType, number> = new Map()
    let totalSeedsUsed = 0;

    for (const [id, cropCycleData] of cycleData.value.entries()) {
        const { type } = parseCropId(id)
        let seedCountTracker = seedCountsTracker.get(type) ?? 0
        const seedsUsed = (cropCycleData.cropCount * Math.floor(cropCycleData.totalHarvestsCount / cropCycleData.phases.length))

        seedCountTracker += seedsUsed
        totalSeedsUsed += seedsUsed
        seedCountsTracker.set(type, seedCountTracker)
    }

    return {
        totalCount: totalSeedsUsed,
        individualCount: seedCountsTracker
    }
})

/**
 * Might as well put everything in one place to calculate only one loop
 */
const seedData = computed(() => {

    const seedCountsTracker: Map<CropType, number> = new Map()
    let totalSeedsUsed = 0;

    const replantCostsZeki = new Map<CropType, number>();
    const totalCostsZeki = new Map<CropType, number>();
    // no replantCosts Combined cause replant days vary per crop
    let totalCostsZekiCombined = 0;

    const replantCostsGuild = new Map<CropType, number>();
    const totalCostsGuild = new Map<CropType, number>();
    let totalCostsGuildCombined = 0;

    const replantCostsPotion = new Map<CropType, number>();
    const totalCostsPotion = new Map<CropType, number>();
    let totalCostsPotionCombined = 0;

    const replantCostsValue = new Map<CropType, number>()
    const totalCostsValue = new Map<CropType, number>
    let totalCostsValueCombined = 0;

    for (const [id, cropCycleData] of cycleData.value.entries()) {
        const { type, isStar } = parseCropId(id)
        const crop = getCropFromType(type)!
        const { zekiPrice, guildPrice, potionPrice } = crop.costs
        const seedsUsed = (cropCycleData.cropCount * Math.floor(cropCycleData.totalHarvestsCount / cropCycleData.phases.length))

        // seed count tracking
        let seedCountTracker = seedCountsTracker.get(type) ?? 0
        seedCountTracker += seedsUsed
        totalSeedsUsed += seedsUsed
        seedCountsTracker.set(type, seedCountTracker)

        // price tracking
        if (zekiPrice !== 0) {
            const replantTracker = replantCostsZeki.get(type) ?? 0
            const replantCost = cropCycleData.cropCount * zekiPrice;
            replantCostsZeki.set(type, replantTracker + replantCost)

            const totalTracker = totalCostsZeki.get(type) ?? 0
            const totalCost = zekiPrice * seedsUsed
            totalCostsZeki.set(type, totalTracker + totalCost)
            totalCostsZekiCombined += totalCost
        }
        if (guildPrice !== 0) {
            const replantTracker = replantCostsPotion.get(type) ?? 0
            const replantCost = cropCycleData.cropCount * guildPrice;
            replantCostsGuild.set(type, replantTracker + replantCost)

            const totalTracker = totalCostsGuild.get(type) ?? 0
            const totalCost = guildPrice * seedsUsed
            totalCostsGuild.set(type, totalTracker + totalCost)
            totalCostsGuildCombined += totalCost
        }
        if (potionPrice !== 0) {
            const replantTracker = replantCostsPotion.get(type) ?? 0
            const replantCost = cropCycleData.cropCount * potionPrice;
            replantCostsPotion.set(type, replantTracker + replantCost)

            const totalTracker = totalCostsPotion.get(type) ?? 0
            const totalCost = potionPrice * seedsUsed
            totalCostsPotion.set(type, totalTracker + totalCost)
            totalCostsPotionCombined += totalCost
        }

        const seedValue = crop.goldValues[(isStar) ? 'seedStar' : 'seed']
        if (seedValue) {
            const valueTracker = replantCostsValue.get(type) ?? 0
            const replantCost = cropCycleData.cropCount * seedValue
            replantCostsValue.set(type, valueTracker + replantCost)

            const totalTracker = totalCostsValue.get(type) ?? 0
            const totalCost = seedValue * seedsUsed
            totalCostsValue.set(type, totalTracker + totalCost)
            totalCostsValueCombined += totalCost
        }
    }

    return {
        totalSeedsUsed,
        seedCountsTracker,

        replantCostsZeki,
        totalCostsZeki,
        totalCostsZekiCombined,

        replantCostsGuild,
        totalCostsGuild,
        totalCostsGuildCombined,

        replantCostsPotion,
        totalCostsPotion,
        totalCostsPotionCombined,

        replantCostsValue,
        totalCostsValue,
        totalCostsValueCombined
    }
})
</script>

<template>
    <thead>
        <tr class="bg-misc dark:bg-palia-blue-dark text-accent">
            <th colspan="2">
                <FontAwesomeIcon :icon="['fas', 'seedling']" class="text-accent pr-1" />Seed Data
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>Total Seeds Used ({{ lastGrowthTick }} Days)</th>
            <td>{{ seedData.totalSeedsUsed }}</td>
        </tr>
        <tr v-for="[type, count] of seedData.seedCountsTracker">
            <th class="indent-3 capitalize">{{ type }}</th>
            <td>{{ count }}</td>
        </tr>
    </tbody>
    <thead>
        <tr class="bg-misc dark:bg-palia-blue-dark text-accent">
            <th colspan="2">Seed Costs <span class="text-xs font-normal"> - Shows different sources of seeds and how
                    much they would cost</span></th>
        </tr>
    </thead>
    <tbody>
        <template v-if="seedData.replantCostsZeki.size > 0">
            <tr class="not-first:border-t-4 not-first:dark:border-t-palia-blue-dark">
                <th colspan="2" class="">Seeds eligible for Store Purchase <span class="font-normal">(e.g.
                        Zeki)</span>
                </th>
            </tr>
            <template v-for="[type, count] of seedData.replantCostsZeki">
                <tr class="border-t-2 dark:border-t-palia-blue-dark">
                    <th class="capitalize indent-3" colspan="">{{ type }}</th>
                    <td class="flex items-center gap-0.5"><img width="16" height="16"
                            src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined"
                            alt="Gold" format="webp">{{ formatToOneDecimal(count).toLocaleString() }} / Replant</td>
                </tr>
                <tr v-if="seedData.totalCostsZeki.get(type)">
                    <th class="indent-6">Total</th>
                    <td class="flex items-center gap-0.5"><img width="16" height="16"
                            src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined"
                            alt="Gold" format="webp">{{
                                formatToOneDecimal(seedData.totalCostsZeki.get(type) ?? 0).toLocaleString() }}</td>
                </tr>
            </template>

            <tr v-if="seedData.replantCostsZeki.size > 1" class="border-t-2 dark:border-t-palia-blue-dark">
                <th class="indent-3 font-bold">Total Costs Combined</th>
                <td class="flex items-center gap-0.5"><img width="16" height="16"
                        src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
                        format="webp">{{
                            formatToOneDecimal(seedData.totalCostsZekiCombined).toLocaleString() }}</td>
            </tr>
        </template>

        <template v-if="seedData.replantCostsGuild.size > 0">
            <tr class="not-first:border-t-4 not-first:dark:border-t-palia-blue-dark">
                <th colspan="2" class="">Seeds eligible for Guild Purchase <span class="font-normal">(e.g.
                        Badruu)</span>
                </th>
            </tr>
            <template v-for="[type, count] of seedData.replantCostsGuild">
                <tr class="border-t-2 dark:border-t-palia-blue-dark">
                    <th class="capitalize indent-3" colspan="">{{ type }}</th>
                    <td class="flex items-center gap-0.5"><img width="16" height="16"
                            src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-[1rem]"
                            :srcset="undefined" alt="Gold" format="webp">{{ formatToOneDecimal(count).toLocaleString()
                            }} / Replant</td>
                </tr>
                <tr v-if="seedData.totalCostsGuild.get(type)">
                    <th class="indent-6">Total Cost</th>
                    <td class="flex items-center gap-0.5"><img width="16" height="16"
                            src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-[1rem]"
                            :srcset="undefined" alt="Gold" format="webp">{{
                                formatToOneDecimal(seedData.totalCostsGuild.get(type) ??
                                    0).toLocaleString()
                            }}</td>
                </tr>
            </template>
            <tr v-if="seedData.replantCostsGuild.size > 1" class="border-t-2 dark:border-t-palia-blue-dark">
                <th>Total Costs Combined</th>
                <td class="flex items-center gap-0.5"><img width="16" height="16"
                        src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-[1rem]" :srcset="undefined"
                        alt="Gold" format="webp">{{
                            formatToOneDecimal(seedData.totalCostsGuildCombined).toLocaleString() }}</td>
            </tr>
        </template>

        <template v-if="seedData.replantCostsPotion.size > 0">
            <tr class="not-first:border-t-4 not-first:dark:border-t-palia-blue-dark">
                <th colspan="2" class="">Seeds available via Infected Essence<span class="font-normal">(e.g.
                        Tamala)</span>
                </th>
            </tr>
            <template v-for="[type, count] of seedData.replantCostsPotion">
                <tr>
                    <th class="capitalize indent-3" colspan="">{{ type }}</th>
                    <td class="flex items-center gap-0.5"><img width="16" height="16"
                            src="https://pgp-cdn.b-cdn.net/infected-essence.webp" class="max-h-[1rem]"
                            :srcset="undefined" alt="Gold" format="webp">{{ formatToOneDecimal(count).toLocaleString()
                            }} / Replant</td>
                </tr>
                <tr v-if="seedData.totalCostsPotion.get(type)">
                    <th class="indent-6">Total</th>
                    <td class="flex items-center gap-0.5"><img width="16" height="16"
                            src="https://pgp-cdn.b-cdn.net/infected-essence.webp" class="max-h-[1rem]"
                            :srcset="undefined" alt="Gold" format="webp">{{
                                formatToOneDecimal(seedData.totalCostsPotion.get(type) ?? 0).toLocaleString() }}</td>
                </tr>

                <tr v-if="seedData.replantCostsPotion.size > 1" class="border-t-2 dark:border-t-palia-blue-dark">
                    <th>Total Costs Combined</th>
                    <td class="flex items-center gap-0.5"><img width="16" height="16"
                            src="https://pgp-cdn.b-cdn.net/infected-essence.webp" class="max-h-[1rem]"
                            :srcset="undefined" alt="Gold" format="webp">{{
                                formatToOneDecimal(seedData.totalCostsPotionCombined).toLocaleString() }}</td>
                </tr>
            </template>
        </template>
        <tr class="not-first:border-t-4 not-first:dark:border-t-palia-blue-dark">
            <th colspan="2">Value Cost: <span class="font-normal">Shipping Bin Value</span></th>
        </tr>
        <template v-for="[type, count] of seedData.replantCostsValue">
            <tr class="border-t-2 dark:border-t-palia-blue-dark">
                <th class="capitalize indent-3" colspan="">{{ type }}</th>
                <td class="flex items-center gap-0.5"><img width="16" height="16"
                        src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
                        format="webp">{{ formatToOneDecimal(count).toLocaleString() }} / Replant</td>
            </tr>
            <tr v-if="seedData.totalCostsValue.get(type)" class="">
                <th class="indent-6">Total Cost</th>
                <td class="flex items-center gap-0.5"><img width="16" height="16"
                        src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
                        format="webp">{{
                            formatToOneDecimal(seedData.totalCostsValue.get(type) ?? 0).toLocaleString() }}</td>
            </tr>
        </template>
        <tr v-if="seedData.replantCostsValue.size > 1" class="border-t-2 dark:border-t-palia-blue-dark">
            <th>Total Costs Combined</th>
            <td class="flex items-center gap-0.5"><img width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp"
                    class="max-h-[1rem]" :srcset="undefined" alt="Gold" format="webp">{{
                        formatToOneDecimal(seedData.totalCostsValueCombined).toLocaleString() }}</td>
        </tr>
    </tbody>
</template>