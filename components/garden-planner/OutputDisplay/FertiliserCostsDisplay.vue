<script setup lang="ts">
import FertiliserCostDisplayItem from './FertiliserCostDisplayItem.vue';

const processor = useProcessor()
const harvester = useHarvester()

const gardenHasFertilisers = computed(() => {
	const hasFertilisers = false

	for (const [type, item] of processor.processor.fertiliserCostsPerDay){
		if (item.count > 0) return true
	}

	return false
})
</script>

<template>
	<section
		v-if="processor.settings.useFertilserCostSettings && (gardenHasFertilisers)"
		class="flex flex-col w-full">
		<div class="flex items-end">
			<p class="text-sm font-semibold text-palia-blue-dark dark:text-accent">
				Fertiliser costs
			</p>
		</div>
		<div class="bg-accent rounded-md border border-misc-dark">
			<ul class="flex gap-4 p-2">
				<FertiliserCostDisplayItem
v-for="[type, item] in processor.processor.fertiliserCostsPerDay" :key="type"
					:item="item" :fertiliser-type="type" />
			</ul>
			<div class="text-palia-blue text-xs px-2 pb-2 flex gap-2">
				<p v-if="processor.fertiliserCostsPerDay.gold > 0" class="flex items-center p-1 border border-misc rounded-sm"><span class="font-bold">Daily:</span>
					<img
width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4 inline pr-1"
						:srcset="undefined" alt="Gold" format="webp">
					{{ (processor.fertiliserCostsPerDay.gold).toLocaleString() }} <span class="px-1">|</span>
					<span class="font-bold">Total:</span>
					<img
width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4 inline pr-1"
						:srcset="undefined" alt="Gold" format="webp">{{ Math.round(processor.fertiliserCostsPerDay.gold
							* harvester.harvester.totalHarvest.lastHarvestDay).toLocaleString() }}
				</p>

				<p v-if="processor.fertiliserCostsPerDay.medals > 0" class="flex items-center p-1 border border-misc rounded-sm"><span class="font-bold">Daily:</span>
					<img
width="16" height="16" src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-4 inline pr-1"
						:srcset="undefined" alt="Gold" format="webp">
					{{ (processor.fertiliserCostsPerDay.medals).toLocaleString() }} <span class="px-1">|</span>
					<span class="font-bold">Total:</span>
					<img
width="16" height="16" src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-4 inline pr-1"
						:srcset="undefined" alt="Gold" format="webp">{{ Math.round(processor.fertiliserCostsPerDay.medals
							* harvester.harvester.totalHarvest.lastHarvestDay).toLocaleString() }}
							
				</p>
			</div>
		</div>
	</section>
</template>
