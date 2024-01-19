<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'
import CropDisplayAlt from './CropDisplayAlt.vue'
import type { IDayLog } from '~/assets/scripts/garden-planner/imports'

const props = defineProps({
  logs: {
    type: Object as PropType<IDayLog[]>,
    required: true,
  },
})

const logs = ref<IDayLog[]>(props.logs)

watch(
  () => props.logs,
  (newLogs) => {
    logs.value = newLogs
  },
  { immediate: true },
)

const { list, containerProps, wrapperProps } = useVirtualList(logs, {
  itemHeight: 92,
  overscan: 10,
})
</script>

<template>
  <div v-bind="containerProps" class="h-screen mb-4 overflow-y-scroll rounded-md isolate max-h-64 bg-secondary">
    <ul v-bind="wrapperProps" class="grid gap-2 py-2 rounded-md ">
      <template v-for="{ index, data: log } in list" :key="index">
        <div class="px-2">
          <p class="flex items-center text-sm font-bold text-misc">
            Day {{ log.day }} -
            <nuxt-img
              width="16"
              height="16"
              src="/gold.webp" class="max-h-[1rem]"
              :srcset="undefined"
              placeholder
              alt="Gold" format="webp"
            />
            {{ log.gold }}
          </p>
          <div class="flex gap-2">
            <section
              v-if="log.items.length > 0"
              class="px-1 rounded-md bg-quality-increase-dark w-fit"
            >
              <p class="w-full pt-1 mb-1 text-xs border-b">
                Sold
              </p>
              <ul class="flex flex-wrap items-start justify-start max-w-lg gap-1 w-fit">
                <template v-for="(item, itemIndex) in log.items" :key="itemIndex">
                  <CropDisplayAlt
                    :img-src="item.image"
                    :amount="item.count"
                    :star="item.isStar"
                    :tooltip="`${item.price * item.count}g`"
                  />
                </template>
              </ul>
            </section>
            <section
              v-if="log.itemCosts.length > 0"
              class="px-1 rounded-md bg-error w-fit"
            >
              <p class="w-full pt-1 mb-1 text-xs border-b">
                Costs
              </p>
              <ul class="flex flex-wrap items-start justify-start max-w-lg gap-1 w-fit">
                <template v-for="(item, itemIndex) in log.itemCosts" :key="itemIndex">
                  <CropDisplayAlt
                    :img-src="item.image"
                    :amount="item.count"
                    :star="item.isStar"
                    :tooltip="`-${item.price * item.count}g : Taken for replanting`"
                  />
                </template>
              </ul>
            </section>
          </div>
        </div>
      </template>
    </ul>
  </div>
</template>
