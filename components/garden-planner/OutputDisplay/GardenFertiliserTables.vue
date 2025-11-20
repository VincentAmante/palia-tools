<script setup lang="ts">
import useHarvester from '~/stores/useHarvester'
import useGarden from '~/stores/useGarden'
import { getFertiliserFromType } from '~/assets/scripts/garden-planner/fertiliserList'
import { FertiliserType } from '~/assets/scripts/garden-planner/imports'
import { getBonusDataByFertiliser } from '~/assets/scripts/garden-planner/utils/garden-helpers'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
const harvester = useHarvester()
const garden = useGarden()

const plotStat = computed(() => garden.plotStat)

const lastGrowthTick = computed(() => harvester.harvester.totalHarvest.lastHarvestDay)

const fertilisersPerDay = computed(() => {
    return Object.values(plotStat.value.fertiliserCount).reduce((acc, value) => (acc + value))
})

const totalFertilisers = computed(() => (fertilisersPerDay.value * lastGrowthTick.value).toLocaleString())

interface IFertiliserBatchCost {
    rawCost: number
    batches: number
    batchCost: number
}

function createInitialCounts<T extends string>(enumType: Record<string, T>): Record<T, IFertiliserBatchCost> {
    return Object.fromEntries(
        Object.values(enumType).map(value => [value, {
            rawCost: 0,
            batches: 0,
            batchCost: 0
        }])
    ) as Record<T, IFertiliserBatchCost>
}

const fertiliserShopCostTracker = computed(() => {
    let totalDailyRawCost = 0;
    let totalOverallBatchCost = 0;

    const fertiliserCostTracker: Record<FertiliserType, IFertiliserBatchCost> = createInitialCounts(FertiliserType)

    Object.entries(plotStat.value.fertiliserCount).forEach(([id, count]) => {
        const fertiliser = getFertiliserFromType(id as FertiliserType)
        if (!fertiliser) return
        const { zekiBatchPrice, zekiBatchCount } = fertiliser.costs

        if (zekiBatchPrice === 0) return;

        const shopPricePerUnit = zekiBatchPrice / zekiBatchCount
        const rawCost = (shopPricePerUnit * count)
        const batchesNeeded = Math.ceil((count * lastGrowthTick.value) / zekiBatchCount);
        const batchCost = (batchesNeeded * zekiBatchPrice)

        totalDailyRawCost += rawCost
        totalOverallBatchCost += batchCost

        fertiliserCostTracker[id as FertiliserType].rawCost = rawCost
        fertiliserCostTracker[id as FertiliserType].batches = batchesNeeded
        fertiliserCostTracker[id as FertiliserType].batchCost = batchCost
    })

    return {
        fertilisers: fertiliserCostTracker,
        total: {
            rawCost: totalDailyRawCost,
            batchCost: totalOverallBatchCost
        }
    }
})

const fertiliserGuildCostTracker = computed(() => {
    let totalDailyRawCost = 0;
    let totalOverallBatchCost = 0;

    const fertiliserCostTracker: Record<FertiliserType, IFertiliserBatchCost> = createInitialCounts(FertiliserType)

    Object.entries(plotStat.value.fertiliserCount).forEach(([id, count]) => {
        const fertiliser = getFertiliserFromType(id as FertiliserType)
        if (!fertiliser) return
        const { guildBatchPrice, guildBatchCount } = fertiliser.costs

        if (guildBatchPrice === 0) return;

        const shopPricePerUnit = guildBatchPrice / guildBatchCount
        const rawCost = (shopPricePerUnit * count)
        const overallBatchesNeeded = Math.ceil((count * lastGrowthTick.value) / guildBatchCount);
        const overallBatchCost = (overallBatchesNeeded * guildBatchPrice)

        console.log('overallBatchCost', overallBatchCost)

        totalDailyRawCost += rawCost
        totalOverallBatchCost += overallBatchCost

        fertiliserCostTracker[id as FertiliserType].rawCost = rawCost
        fertiliserCostTracker[id as FertiliserType].batches = overallBatchesNeeded
        fertiliserCostTracker[id as FertiliserType].batchCost = overallBatchCost
    })

    console.log(fertiliserCostTracker)

    return {
        fertilisers: fertiliserCostTracker,
        total: {
            rawCost: totalDailyRawCost,
            batchCost: totalOverallBatchCost
        }
    }
})

const fertiliserSellCostTracker = computed(() => {
    let totalRawCost = 0;

    const fertiliserCostTracker: Record<FertiliserType, IFertiliserBatchCost> = createInitialCounts(FertiliserType)

    Object.entries(plotStat.value.fertiliserCount).forEach(([id, count]) => {
        const fertiliser = getFertiliserFromType(id as FertiliserType)
        if (!fertiliser) return
        const { goldSellValue } = fertiliser.costs

        if (goldSellValue === 0) return;

        const rawCost = (goldSellValue * count)

        totalRawCost += rawCost
        fertiliserCostTracker[id as FertiliserType].rawCost = rawCost
    })

    return {
        fertilisers: fertiliserCostTracker,
        total: {
            rawCost: totalRawCost,
            batchCost: 0
        }
    }
})

function formatToOneDecimal(num: number) {
    return (parseFloat(num.toFixed(1)));
}


const fertilisersEligibleForStorePurchase = computed(() => {
    const fertilisersFound: {
        type: FertiliserType
        count: number
    }[] = []

    Object.entries(plotStat.value.fertiliserCount).forEach(([id, count]) => {
        if (count === 0) return
        const fertiliser = getFertiliserFromType(id as FertiliserType)
        if (!fertiliser) return
        const { zekiBatchPrice } = fertiliser.costs

        if (zekiBatchPrice !== 0 && count !== 0)
            fertilisersFound.push({
                type: id as FertiliserType,
                count: count
            })
    })

    return fertilisersFound
})

const fertilisersEligibleForGuildPurchase = computed(() => {
    const fertilisersFound: {
        type: FertiliserType
        count: number
    }[] = []

    Object.entries(plotStat.value.fertiliserCount).forEach(([id, count]) => {
        if (count === 0) return
        const fertiliser = getFertiliserFromType(id as FertiliserType)
        if (!fertiliser) return
        const { guildBatchPrice } = fertiliser.costs

        if (guildBatchPrice !== 0 && count !== 0)
            fertilisersFound.push({
                type: id as FertiliserType,
                count: count
            })
    })

    return fertilisersFound
})

const fertilisersIneligibleForPurchase = computed(() => {
    const fertilisersFound: {
        type: FertiliserType
        count: number
    }[] = []

    Object.entries(plotStat.value.fertiliserCount).forEach(([id, count]) => {
        if (count === 0) return
        const fertiliser = getFertiliserFromType(id as FertiliserType)
        if (!fertiliser) return
        const { guildBatchPrice, zekiBatchPrice } = fertiliser.costs

        if (guildBatchPrice === 0 && zekiBatchPrice === 0 && count !== 0)
            fertilisersFound.push({
                type: id as FertiliserType,
                count: count
            })
    })

    return fertilisersFound
})
</script>

<template>
    <thead>
        <tr class="bg-misc dark:bg-palia-blue-dark text-accent">
            <th colspan="2" class="">
                <FontAwesomeIcon :icon="['fas', 'poop']" class="text-accent pr-1" />Fertiliser Data
            </th>
        </tr>
    </thead>

    <tbody class="">
        <tr>
            <th>Fertilisers Used / Day</th>
            <td>{{ fertilisersPerDay }}</td>
        </tr>
        <tr>
            <th>Total Fertilisers Used ({{ lastGrowthTick }} Growth Ticks)</th>
            <td>{{ totalFertilisers }}</td>
        </tr>

        <template v-for="[fertiliser, fertiliserCount] of Object.entries(plotStat.fertiliserCount)" :key="fertiliser">
            <template v-if="fertiliser !== FertiliserType.None && fertiliserCount !== 0">
                <tr>
                    <th class="capitalize indent-3">{{ fertiliser }} Used</th>
                    <td>{{ fertiliserCount * lastGrowthTick }}</td>
                </tr>
            </template>
        </template>
    </tbody>


    <thead>
        <tr class="bg-misc text-accent dark:bg-palia-blue-dark">
            <th colspan="2">Fertiliser Costs <span class="text-xs"> - Shows costs of procuring fertiliser
                    from different
                    sources (if available)</span>
            </th>
        </tr>
    </thead>

    <tbody class="">

        <tr class="not-first:border-t-4 not-first:dark:border-t-palia-blue-dark">
            <th colspan="2">Value Cost: <span class="font-normal">Shipping Bin Value</span></th>
        </tr>
        <tr>
            <th class="indent-3">Daily Cost</th>
            <td class="flex items-center gap-0.5"><img width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp"
                    class="max-h-[1rem]" :srcset="undefined" alt="Gold" format="webp"> {{
                        formatToOneDecimal(fertiliserSellCostTracker.total.rawCost).toLocaleString() }} </td>
        </tr>

        <tr>
            <th class="indent-3">Total Cost ({{ lastGrowthTick }} Growth Ticks)</th>
            <td class="flex items-center gap-0.5"><img width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp"
                    class="max-h-[1rem]" :srcset="undefined" alt="Gold" format="webp"> {{
                        formatToOneDecimal(fertiliserSellCostTracker.total.rawCost *
                            lastGrowthTick).toLocaleString() }}</td>
        </tr>
        <template
            v-if="(fertilisersEligibleForStorePurchase.length > 0) || (fertilisersEligibleForGuildPurchase.length > 0)">
            <!-- <tr>
                <th></th>
                <td></td>
            </tr> -->
            <tr class="not-first:border-t-6 not-first:dark:border-t-palia-blue-dark">
                <th colspan="2">Unit Cost: <span class="font-normal">Cost of 1 fertiliser in their
                        purchasable batch mulitplied by the fertilisers
                        needed</span></th>
            </tr>

            <tr>
                <th colspan="2">Batch Cost: <span class="font-normal">Cost of the minimum amount of batches needed to
                        purchase
                        the required amount</span></th>
            </tr>
        </template>

        <template v-if="fertilisersEligibleForStorePurchase.length > 0">
            <tr class="not-first:border-t-4 not-first:dark:border-t-palia-blue-dark">
                <th colspan="2" class="">Fertilisers eligible for Store Purchase <span class="font-normal">(e.g.
                        Zeki)</span>
                </th>
            </tr>
            <tr v-for="fertiliser in fertilisersEligibleForStorePurchase">
                <th class="capitalize indent-3">
                    {{ fertiliser.type }}
                </th>
                <td>{{ fertiliser.count }} / Day</td>
            </tr>
            <tr class="border-t-2 dark:border-t-palia-blue-dark">
                <th class="indent-3">Daily Store Price</th>
                <td class="flex items-center gap-0.5"><img width="16" height="16"
                        src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
                        format="webp"> {{
                            formatToOneDecimal(fertiliserShopCostTracker.total.rawCost).toLocaleString() }}</td>
            </tr>

            <tr>
                <th class="indent-3">Total Store Price (Unit)</th>
                <td class="flex items-center gap-0.5"><img width="16" height="16"
                        src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
                        format="webp"> {{
                            formatToOneDecimal(fertiliserShopCostTracker.total.rawCost *
                                lastGrowthTick).toLocaleString() }}</td>
            </tr>
            <tr>
                <th class="indent-3">Total Store Price (Batch)</th>
                <td class="flex items-center gap-0.5"><img width="16" height="16"
                        src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
                        format="webp"> {{
                            formatToOneDecimal(fertiliserShopCostTracker.total.batchCost).toLocaleString() }}</td>
            </tr>
        </template>
        <template v-if="fertilisersEligibleForGuildPurchase.length > 0">
            <tr class="not-first:border-t-4 not-first:dark:border-t-palia-blue-dark">
                <th colspan="2" class="">Fertilisers eligible for Guild Purchase <span class="font-normal">(e.g.
                        Badruu)</span>
                </th>
            </tr>
            <tr v-for="fertiliser in fertilisersEligibleForGuildPurchase">
                <th class="capitalize indent-3">
                    {{ fertiliser.type }}
                </th>
                <td>{{ fertiliser.count }} / Day</td>
            </tr>
            <tr class="border-t-2">
                <th class="indent-3">Daily Guild Price</th>
                <td class="flex items-center gap-0.5"><img width="16" height="16"
                        src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-[1rem]" :srcset="undefined"
                        alt="Gold" format="webp"> {{
                            formatToOneDecimal(fertiliserGuildCostTracker.total.rawCost).toLocaleString() }}</td>
            </tr>

            <tr>
                <th class="indent-3">Total Guild Price (Unit)</th>
                <td class="flex items-center gap-0.5"><img width="16" height="16"
                        src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-[1rem]" :srcset="undefined"
                        alt="Gold" format="webp">{{
                            formatToOneDecimal(fertiliserGuildCostTracker.total.rawCost *
                                lastGrowthTick).toLocaleString() }}</td>
            </tr>
            <tr>
                <th class="indent-3">Total Guild Price (Batch)</th>
                <td class="flex items-center gap-0.5"><img width="16" height="16"
                        src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-[1rem]" :srcset="undefined"
                        alt="Gold" format="webp">{{
                            formatToOneDecimal(fertiliserGuildCostTracker.total.batchCost).toLocaleString() }}</td>
            </tr>
        </template>

        <template v-if="fertilisersIneligibleForPurchase.length > 0">
            <tr>
                <th colspan="2" class="">Fertilisers ineligible for any purchase
                </th>
            </tr>
            <tr v-for="fertiliser in fertilisersIneligibleForPurchase">
                <th class="capitalize indent-3">
                    {{ fertiliser.type }}
                </th>
                <td>{{ fertiliser.count }} / Day</td>
            </tr>
        </template>

        <!-- <template
            v-if="(fertilisersEligibleForStorePurchase.length > 0) || (fertilisersEligibleForGuildPurchase.length > 0)">
            <tr>
                <th></th>
                <td></td>
            </tr>
        </template> -->
        <template v-for="[fertiliser, fertiliserCount] of Object.entries(plotStat.fertiliserCount)" :key="fertiliser">
            <template v-if="fertiliser !== FertiliserType.None && fertiliserCount > 0">
                <tr class="not-first:border-t-4 not-first:dark:border-t-palia-blue-dark">
                    <th class="capitalize">{{
                        fertiliser }} <font-awesome-icon
                            :icon="['fas', getBonusDataByFertiliser(fertiliser as FertiliserType).icon]"
                            :class="getBonusDataByFertiliser(fertiliser as FertiliserType).colour" /> </th>
                    <td></td>
                </tr>

                <tr>
                    <th class="capitalize indent-3">Daily Cost: By Value</th>
                    <td class="flex items-center gap-0.5"><img width="16" height="16"
                            src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined"
                            alt="Gold" format="webp"> {{
                                formatToOneDecimal(fertiliserSellCostTracker.fertilisers[fertiliser as
                                    FertiliserType].rawCost).toLocaleString()
                            }}</td>
                </tr>

                <tr>
                    <th class="capitalize indent-3">Total Cost: By Value</th>
                    <td class="flex items-center gap-0.5"><img width="16" height="16"
                            src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined"
                            alt="Gold" format="webp"> {{
                                formatToOneDecimal(fertiliserSellCostTracker.fertilisers[fertiliser as
                                    FertiliserType].rawCost * lastGrowthTick).toLocaleString()
                            }}</td>
                </tr>
                <template v-if="fertiliserShopCostTracker.fertilisers[fertiliser as FertiliserType].rawCost !== 0">
                    <tr>
                        <th class="capitalize indent-3">Daily Cost: By Unit (Store)</th>
                        <td class="flex items-center gap-0.5"><img width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined"
                                alt="Gold" format="webp"> {{
                                    formatToOneDecimal(fertiliserShopCostTracker.fertilisers[fertiliser as
                                        FertiliserType].rawCost).toLocaleString() }}</td>
                    </tr>
                    <tr>
                        <th class="capitalize indent-3">Total Cost: By Unit (Store)</th>
                        <td class="flex items-center gap-0.5"><img width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined"
                                alt="Gold" format="webp"> {{
                                    formatToOneDecimal(fertiliserShopCostTracker.fertilisers[fertiliser as
                                        FertiliserType].rawCost * lastGrowthTick).toLocaleString() }}</td>
                    </tr>
                    <tr>
                        <th class="capitalize indent-3">Total Batches To Buy (Store)</th>
                        <td>{{ formatToOneDecimal(fertiliserShopCostTracker.fertilisers[fertiliser as
                            FertiliserType].batches).toLocaleString() }}</td>
                    </tr>
                    <tr>
                        <th class="capitalize indent-3">Total Batches Cost (Store)</th>
                        <td class="flex items-center gap-0.5"><img width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined"
                                alt="Gold" format="webp"> {{
                                    formatToOneDecimal(fertiliserShopCostTracker.fertilisers[fertiliser as
                                        FertiliserType].batchCost).toLocaleString() }}</td>
                    </tr>
                </template>
                <template v-if="fertiliserGuildCostTracker.fertilisers[fertiliser as FertiliserType].rawCost !== 0">
                    <tr>
                        <th class="capitalize indent-3">Daily Cost: By Unit (Guild)</th>
                        <td class="flex items-center gap-0.5"><img width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-[1rem]"
                                :srcset="undefined" alt="Gold" format="webp">{{
                                    formatToOneDecimal(fertiliserGuildCostTracker.fertilisers[fertiliser as
                                        FertiliserType].rawCost).toLocaleString()
                                }}</td>
                    </tr>
                    <tr>
                        <th class="capitalize indent-3">Total Cost: By Unit (Guild)</th>
                        <td class="flex items-center gap-0.5"><img width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-[1rem]"
                                :srcset="undefined" alt="Gold" format="webp">{{
                                    formatToOneDecimal(fertiliserGuildCostTracker.fertilisers[fertiliser as
                                        FertiliserType].rawCost * lastGrowthTick).toLocaleString()
                                }}</td>
                    </tr>
                    <tr>
                        <th class="capitalize indent-3">Total Batches to Buy (Guild)</th>
                        <td>{{ formatToOneDecimal(fertiliserGuildCostTracker.fertilisers[fertiliser as
                            FertiliserType].batches).toLocaleString()
                            }}</td>
                    </tr>
                    <tr>
                        <th class="capitalize indent-3">Total Batches Cost (Guild)</th>
                        <td class="flex items-center gap-0.5"><img width="16" height="16"
                                src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-[1rem]"
                                :srcset="undefined" alt="Gold" format="webp">{{
                                    formatToOneDecimal(fertiliserGuildCostTracker.fertilisers[fertiliser as
                                        FertiliserType].batchCost
                                    ).toLocaleString() }}</td>
                    </tr>
                </template>
            </template>
        </template>
    </tbody>
</template>