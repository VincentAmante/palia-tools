<template>
  <div class="font-mono text-sm leading-relaxed text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto max-h-[600px]">
    <!-- NULL / UNDEFINED -->
    <span v-if="value === null" class="text-gray-400 italic">null</span>
    <span v-else-if="value === undefined" class="text-gray-400 italic">undefined</span>

    <!-- BOOLEAN -->
    <span v-else-if="typeof value === 'boolean'" class="text-blue-600 font-medium">
      {{ value }}
    </span>

    <!-- NUMBER -->
    <span v-else-if="typeof value === 'number'" class="text-blue-600">
      {{ value }}
    </span>

    <!-- BIGINT -->
    <span v-else-if="typeof value === 'bigint'" class="text-blue-600">
      {{ value }}n
    </span>

    <!-- STRING -->
    <span v-else-if="typeof value === 'string'" class="text-green-800">
      "{{ value }}"
    </span>

    <!-- SYMBOL -->
    <span v-else-if="typeof value === 'symbol'" class="text-purple-600">
      {{ value.toString() }}
    </span>

    <!-- FUNCTION -->
    <span v-else-if="typeof value === 'function'" class="text-purple-600 italic">
      ƒ {{ value.name || 'anonymous' }}()
    </span>

    <!-- DATE -->
    <span v-else-if="value instanceof Date" class="text-orange-600">
      {{ value.toISOString() }}
    </span>

    <!-- REGEXP -->
    <span v-else-if="value instanceof RegExp" class="text-orange-600">
      {{ value.toString() }}
    </span>

    <!-- ERROR -->
    <div v-else-if="value instanceof Error" class="text-red-600">
      <span class="font-bold">{{ value.name }}</span>: <span>{{ value.message }}</span>
    </div>

    <!-- MAP -->
    <div v-else-if="value instanceof Map" class="map">
      <div v-if="isCircular" class="text-red-600 italic bg-red-50 px-1.5 py-0.5 rounded inline-block">[Circular Reference]</div>
      <div v-else>
        <div class="cursor-pointer select-none inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors duration-100 hover:bg-gray-200" @click="toggle">
          <span class="text-xs inline-block w-3.5 text-gray-500">{{ isExpanded ? '▼' : '▶' }}</span>
          <span>Map({{ value.size }})</span>
        </div>
        <div v-if="isExpanded" class="ml-5 pl-2 border-l border-dashed border-gray-300">
          <div v-for="[mapKey, mapVal] in value" :key="mapKey" class="my-1 flex flex-wrap items-baseline gap-1.5">
            <span class="text-red-600 font-medium">[key]:</span>
            <ObjectViewer :value="mapKey" :depth="depth + 1" :expand-depth="expandDepth" :visited="nextVisited" />
            <span class="text-gray-500 mx-0.5">=></span>
            <ObjectViewer :value="mapVal" :depth="depth + 1" :expand-depth="expandDepth" :visited="nextVisited" />
          </div>
        </div>
        <div v-else class="text-gray-500 ml-[18px]">
          Map({{ value.size }})
        </div>
      </div>
    </div>

    <!-- SET -->
    <div v-else-if="value instanceof Set" class="set">
      <div v-if="isCircular" class="text-red-600 italic bg-red-50 px-1.5 py-0.5 rounded inline-block">[Circular Reference]</div>
      <div v-else>
        <div class="cursor-pointer select-none inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors duration-100 hover:bg-gray-200" @click="toggle">
          <span class="text-xs inline-block w-3.5 text-gray-500">{{ isExpanded ? '▼' : '▶' }}</span>
          <span>Set({{ value.size }})</span>
        </div>
        <div v-if="isExpanded" class="ml-5 pl-2 border-l border-dashed border-gray-300">
          <div v-for="(item, idx) in Array.from(value)" :key="idx" class="my-1 flex flex-wrap items-baseline gap-1.5">
            <ObjectViewer :value="item" :depth="depth + 1" :expand-depth="expandDepth" :visited="nextVisited" />
          </div>
        </div>
        <div v-else class="text-gray-500 ml-[18px]">
          Set({{ value.size }})
        </div>
      </div>
    </div>

    <!-- ARRAY -->
    <div v-else-if="Array.isArray(value)" class="array">
      <div v-if="isCircular" class="text-red-600 italic bg-red-50 px-1.5 py-0.5 rounded inline-block">[Circular Reference]</div>
      <div v-else>
        <div class="cursor-pointer select-none inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors duration-100 hover:bg-gray-200" @click="toggle">
          <span class="text-xs inline-block w-3.5 text-gray-500">{{ isExpanded ? '▼' : '▶' }}</span>
          <span>Array({{ value.length }})</span>
        </div>
        <div v-if="isExpanded" class="ml-5 pl-2 border-l border-dashed border-gray-300">
          <div v-for="(item, idx) in value" :key="idx" class="my-1 flex flex-wrap items-baseline gap-1.5">
            <span class="text-red-600 font-medium">{{ idx }}:</span>
            <ObjectViewer :value="item" :depth="depth + 1" :expand-depth="expandDepth" :visited="nextVisited" />
          </div>
        </div>
        <div v-else class="text-gray-500 ml-[18px]">
          [{{ value.length }} items]
        </div>
      </div>
    </div>

    <!-- OBJECT -->
    <div v-else-if="typeof value === 'object'" class="object">
      <div v-if="isCircular" class="text-red-600 italic bg-red-50 px-1.5 py-0.5 rounded inline-block">[Circular Reference]</div>
      <div v-else>
        <div class="cursor-pointer select-none inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors duration-100 hover:bg-gray-200" @click="toggle">
          <span class="text-xs inline-block w-3.5 text-gray-500">{{ isExpanded ? '▼' : '▶' }}</span>
          <span>Object {{ Object.keys(value).length > 0 ? `{${Object.keys(value).length} }` : '{}' }}</span>
        </div>
        <div v-if="isExpanded" class="ml-5 pl-2 border-l border-dashed border-gray-300">
          <div v-for="(propVal, propKey) in value" :key="propKey" class="my-1 flex flex-wrap items-baseline gap-1.5">
            <span class="text-red-600 font-medium">{{ propKey }}:</span>
            <ObjectViewer :value="propVal" :depth="depth + 1" :expand-depth="expandDepth" :visited="nextVisited" />
          </div>
        </div>
        <div v-else class="text-gray-500 ml-[18px]">
          {{ objectSummary(value) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineOptions({ name: 'ObjectViewer' })

const props = defineProps({
  value: { type: null, required: true },
  depth: { type: Number, default: 0 },
  expandDepth: { type: Number, default: 1 },
  visited: { type: Set, default: () => new Set() }
})

const isCircular = computed(() => {
  if (typeof props.value === 'object' && props.value !== null) {
    return props.visited.has(props.value)
  }
  return false
})

const nextVisited = computed(() => {
  if (!isCircular.value && typeof props.value === 'object' && props.value !== null) {
    return new Set([...props.visited, props.value])
  }
  return props.visited
})

const isExpanded = ref(!isCircular.value && props.depth < props.expandDepth)

function toggle() {
  if (!isCircular.value) {
    isExpanded.value = !isExpanded.value
  }
}

function objectSummary(obj) {
  const keys = Object.keys(obj)
  if (keys.length === 0) return '{}'
  const firstKeys = keys.slice(0, 3)
  return `{ ${firstKeys.join(', ')}${keys.length > 3 ? ', ...' : ''} }`
}
</script>