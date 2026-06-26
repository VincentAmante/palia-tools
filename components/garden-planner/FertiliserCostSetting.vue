<script setup lang="ts">
import type { PropType } from 'vue';
import { FertiliserCostSource } from '~/assets/scripts/garden-planner/classes/processor';
import type { FertiliserType } from '~/assets/scripts/garden-planner/imports';
import { getFertiliserFromType } from '~/assets/scripts/garden-planner/imports';
import ItemDisplay from './HarvestCalculator/ItemDisplay.vue';
import ItemDisplayAlt from './HarvestCalculator/ItemDisplayAlt.vue';

const processor = useProcessor()
const grid = useGardenGrid()

const props = defineProps({
    type: {
        type: String as PropType<FertiliserType>,
        required: true
    }
})

const fertiliser = computed(() => getFertiliserFromType(props.type))

const setting = computed({
    get: () => processor.settings.fertiliserCostSettings.get(props.type) || FertiliserCostSource.SELL_VALUE,
    set: (source: FertiliserCostSource) => processor.setFertiliserCostSetting(props.type, source)
})

const isEnabled = computed(() => (grid.analyser.fertiliserCountByType[props.type] > 0))

watchEffect(() => {
    if (grid.analyser.fertiliserCountByType[props.type] > 0 && !processor.settings.fertiliserCostSettings.get(props.type)){
        processor.setFertiliserCostSetting(props.type, FertiliserCostSource.SELL_VALUE)
    }
})
</script>

<template>
    <div v-if="isEnabled" class="text-palia-blue flex gap-2" :class="{ 'opacity-40': !isEnabled}">
        <ItemDisplayAlt  class="border border-misc" :img-src="fertiliser?.image" :img-alt="fertiliser?.type" />

        <div class="join">
            <button
class="btn px-2 join-item"  :class="{'btn-active': setting === FertiliserCostSource.SELL_VALUE }"
            @click="setting = FertiliserCostSource.SELL_VALUE"
            >
                <img
width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4 inline"
                    :srcset="undefined" alt="Gold" format="webp">
                Sell Value
            <font-awesome-icon class="text-xxs" :icon="['fas', 'check']" :class="{'invisible': setting !== FertiliserCostSource.SELL_VALUE}"/>

            </button>

            <button
v-if="fertiliser?.costs.zekiBatchPrice" class="btn px-2 join-item" :class="{'btn-active': setting === FertiliserCostSource.ZEKI_STORE }"
            @click="setting = FertiliserCostSource.ZEKI_STORE">
                <img
width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4 inline"
                    :srcset="undefined" alt="Gold" format="webp">
                Zeki Store
            <font-awesome-icon class="text-xxs" :icon="['fas', 'check']" :class="{'invisible': setting !== FertiliserCostSource.ZEKI_STORE}"/>
            </button>

            <button
v-if="fertiliser?.costs.guildBatchPrice" class="btn px-2 join-item"  :class="{'btn-active': setting === FertiliserCostSource.GUILD_STORE }"
            @click="setting = FertiliserCostSource.GUILD_STORE">
                <img
width="16" height="16" src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-4"
                    :srcset="undefined" alt="Gold" format="webp"> Guild
            <font-awesome-icon class="text-xxs" :icon="['fas', 'check']" :class="{'invisible': setting !== FertiliserCostSource.GUILD_STORE}"/>
            </button>

        </div>
    </div>
</template>