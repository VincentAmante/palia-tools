<script setup lang="ts">
import NewSettings from './NewSettings.vue'
import TotalInventory from './HarvestCalculator/TotalInventory.vue'
</script>

<template>
  <section>
    <section>
      <p>
        Tab Select
      </p>
    </section>
    <section
      id="display-tab"
    >
      <p aria-hidden class="invisible">
        Summary Display
      </p>
      <section>
        <p>
          Gold Summaries
        </p>
      </section>
      <section>
        <p>
          Other Summaries
        </p>
      </section>
      <TotalInventory />
    </section>
    <section
      id="settings-tab"
    >
      <p aria-hidden>
        Settings
      </p>
      <NewSettings />
    </section>
  </section>
</template>
