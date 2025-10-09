<script setup lang="ts">
import { Bonus, CropType } from '~/assets/scripts/garden-planner/imports';

const props = defineProps({
    cropType: {
        type: String as PropType<CropType>,
        required: true
    }
})

const gardenHandler = useGarden()


const plotStat = computed(() => gardenHandler.plotStat)
const cropGroupBonusStats = computed(() => gardenHandler.cropGropBonusStats)
</script>
<template>
    <section class="bg-accent border-misc-dark rounded-sm border overflow-y-auto max-h-96">
        <table
            class="table table-sm table-pin-rows [&_tr]:not-last:border-b [&_tr]:even:bg-secondary/80 [&_tr]:border-b-misc">

            <thead>
                <tr class="bg-misc text-accent">
                    <th>Crop Data</th>
                    <th></th>
                </tr>
            </thead>

            <tbody class="">
                
                <tr>
                    <th>Growth Boosted Crops</th>
                    <td>{{ cropGroupBonusStats.get(cropType)?.[Bonus.SpeedIncrease] }} / {{ plotStat.cropTypeCount[cropType]  }} 
                        ({{ Math.round(((cropGroupBonusStats.get(cropType)?.[Bonus.SpeedIncrease] || 0) / (plotStat.cropTypeCount[cropType])) * 100) }}%)</td>
                </tr>
                
                <tr>
                    <th>Harvest Boosted Crops</th>
                    <td>{{ cropGroupBonusStats.get(cropType)?.[Bonus.HarvestIncrease] }} / {{ plotStat.cropTypeCount[cropType]  }} 
                        ({{ Math.round(((cropGroupBonusStats.get(cropType)?.[Bonus.HarvestIncrease] || 0) / (plotStat.cropTypeCount[cropType])) * 100) }}%)</td>
                </tr>
                <tr>
                    <th>Quality Boosted Crops</th>
                    <td>{{ cropGroupBonusStats.get(cropType)?.[Bonus.QualityIncrease] }} / {{ plotStat.cropTypeCount[cropType]  }} 
                        ({{ Math.round(((cropGroupBonusStats.get(cropType)?.[Bonus.QualityIncrease] || 0) / (plotStat.cropTypeCount[cropType])) * 100) }}%)</td>
                </tr>
                <tr>
                    <th>Water Boosted Crops</th>
                    <td>{{ cropGroupBonusStats.get(cropType)?.[Bonus.WaterRetain] }} / {{ plotStat.cropTypeCount[cropType]  }} 
                        ({{ Math.round(((cropGroupBonusStats.get(cropType)?.[Bonus.WaterRetain] || 0) / (plotStat.cropTypeCount[cropType])) * 100) }}%)</td>
                </tr>
                <tr>
                    <th>Weed Protected Crops</th>
                    <td>{{ cropGroupBonusStats.get(cropType)?.[Bonus.WeedPrevention] }} / {{ plotStat.cropTypeCount[cropType]  }} 
                        ({{ Math.round(((cropGroupBonusStats.get(cropType)?.[Bonus.WeedPrevention] || 0) / (plotStat.cropTypeCount[cropType])) * 100) }}%)</td>
                </tr>
            </tbody>

            <thead>
                <tr class="bg-misc text-accent">
                    <th>Harvest Data</th>
                    <th></th>
                </tr>
            </thead>
            <tbody class="">
                <tr>
                    <th>Complete Cycles</th>
                    <td>5</td>
                </tr>
                <tr>
                    <th>
                        Harvests past last complete cycle
                    </th>
                    <td>
                        3
                    </td>
                </tr>
                <tr>
                    <th>Growth Ticks</th>
                    <td>??</td>
                </tr>
                <tr>
                    <th>Harvest Days per Total Growth Ticks</th>
                    <td>?? / 180 (??%)</td>
                </tr>
                <tr>
                    <th>Growth Ticks / Harvest (First)</th>
                    <td>12</td>
                </tr>
                <tr>
                    <th>Growth Ticks / Harvest (2, 3, 4)</th>
                    <td>6</td>
                </tr>
                <tr>
                    <th>Growth Ticks / Cycle</th>
                    <td>
                        30
                    </td>
                </tr>
                <tr>
                    <th>Overall Growth Ticks</th>
                    <td>180</td>
                </tr>
            </tbody>
            <thead>
                <tr class="bg-misc text-accent">
                    <th>Process Data</th>
                    <th></th>
                </tr>
            </thead>

            <tbody class="">
                <tr>
                    <th>Overall Time</th>
                    <td>5</td>
                </tr>
            </tbody>
        </table>
    </section>
</template>