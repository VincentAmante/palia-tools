<script setup lang="ts">
import type { PropType } from 'vue';
import type { FertiliserType } from '~/assets/scripts/garden-planner/imports';
import type { FertiliserItem } from '~/assets/scripts/garden-planner/utils/garden-helpers';
import { Currency } from '~/assets/scripts/garden-planner/utils/garden-helpers';
import ItemDisplayAlt from '../HarvestCalculator/ItemDisplayAlt.vue';
import ItemDisplay from '../HarvestCalculator/ItemDisplay.vue';
import { FertiliserCostSource } from '~/assets/scripts/garden-planner/classes/processor';

const processor = useProcessor()

const props = defineProps({
    item: {
        type: Object as PropType<FertiliserItem>,
        required: true
    },
    fertiliserType: {
        type: String as PropType<FertiliserType>,
        required: true
    }
})

const source = computed(() => {
    const costSource = processor.settings.fertiliserCostSettings.get(props.fertiliserType)

    if (!costSource) return ''

    switch (costSource) {
        case FertiliserCostSource.SELL_VALUE:
            return 'Item Value'
        case FertiliserCostSource.GUILD_STORE:
            return 'Badruu'
        case FertiliserCostSource.ZEKI_STORE:
            return 'Zeki'
        case FertiliserCostSource.NONE:
        default:
            return 'Excluded'
    }
})
</script>

<template>

    <li class="flex w-fit gap-2 max-w-28">
        <ItemDisplay
class="rounded-md max-h-14 aspect-square" :star="false" :img-src="item.img.src"
            :img-alt="item.img.alt" :count="item.count" :base-gold-value="item.baseGoldValue" />
        <div>
            <p class="text-palia-blue dark:text-accent text-xs font-bold flex">
                <img
v-if="item.currency === Currency.MEDAL" width="16" height="16"
                    src="https://pgp-cdn.b-cdn.net/gardening-medal.webp" class="max-h-4 inline" :srcset="undefined"
                    alt="Gold" format="webp">
                <img
v-else width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4 inline"
                    :srcset="undefined" alt="Gold" format="webp">
                {{ (item.count * item.baseGoldValue).toLocaleString() }}
            </p>
            <p class="text-xxs uppercase text-misc dark:text-accent/80 leading-tight" :class="{'font-bold text-weed-prevention-dark': source === 'Excluded'}">
                {{ source }}
            </p>
        </div>
    </li>
</template>