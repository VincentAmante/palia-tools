<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
    totalCrops: {
        type: Number,
        required: true
    },
    covered: {
        type: Number,
        required: true
    },
    color: String
})

const percent = computed(() => {
    if (props.totalCrops === 0) {
        return '--value:0'
    }
    return `--value:${(props.covered / props.totalCrops) * 100}`
})

const percentString = computed(() => {
    if (props.totalCrops === 0) {
        return '0'
    }
    return `${((props.covered / props.totalCrops) * 100).toFixed(0)}`
})

</script>

<template>
    <div class="coverage-stat flex flex-col items-center justify-center gap-2 group">
    
        <div class="radial-progress bg-white bg-opacity-20 group-hover:bg-opacity-60 transition-all border-4 border-solid  border-white border-opacity-0"
            :style="[percent, '--size: clamp(8px, 4.35rem, 18vw)']">
            <div class="relative flex flex-col text-center items-center justify-center">
                <div class="pt-2 md:pt-3 text-lg lg:text-xl flex flex-col items-center justify-center te">
                        <slot name="icon">
                        </slot>
                    </div>
                <div class="text font-semibold text-center flex flex-col items-center justify-center">
                    <p class="flex items-center text-sm gap-[1px]">{{ percentString }}<span class="text-xs">%</span></p>
                </div>
            </div>
        </div>
        <div class="uppercase font-semibold max-w-[12ch] text-xs  h-12 text-center break-words align-top flex items-start">
            <slot name="title">
                Title missing
            </slot>
        </div>
    </div>
</template>