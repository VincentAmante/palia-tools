<script setup lang="ts">
import HousePlanner from '@/components/house-planner/HousePlanner.vue'

useHead({
  link: [
    {
      rel: 'canonical',
      href: 'https://palia-garden-planner.vercel.app/',
    },
  ],
})

definePageMeta({
  layout: 'housing',
})
</script>

<template>
  <main class="flex flex-col gap-2 p-4 px-2 lg:px-12">
    <div class="bg-warning p-2 pt-4 rounded-md lg:mx-8 mb-2 flex flex-col items-center">
      <div class="flex flex-col gap-1  text-neutral text-center">
        <font-awesome-icon :icon="['fas', 'screwdriver-wrench']" class="text-xl" />
        <h2 class="font-black text-2xl">
          In Prototype Phase
        </h2>
        <p class="text-sm max-w-xl font-normal">
          This tool is released primarily as a proof-of-concept and is not ready for regular use.
          Many features are missing and bugs are to be expected.
          <!-- Do provide feedback to its developer <span class="font-black">.aisen</span> -->
        </p>
      </div>
    </div>
    <ClientOnly>
      <HousePlanner />
    </ClientOnly>
    <div class="flex flex-col lg:flex-row justify-between lg:mx-2 gap-2">
      <section class="collapse bg-base-200 rounded-md mt-4 h-fit collapse-arrow">
        <input type="checkbox">
        <div class="collapse-title text-2xl font-medium">
          Quick Dev Note
        </div>
        <div class="collapse-content max-w-xl">
          <div class="flex flex-col gap-2">
            <p class="font-bold">
              Hey folks!
            </p>
            <p>
              I had this project sitting around a while back,
              initially requested by <span class="italic">Shepp Arenvanya</span> from the Palia Discord and who also provided the initial information to get this started.
            </p>
            <p>
              I've been stuck working on crafters for the garden planner for a while now,
              and demand for a housing planner has been increasing. So I've decided to take a detour
              and get this to a prototype stage.
            </p>
            <p>
              For now, this is a proof-of-concept and is not ready for regular use.
              This tool will be developed now and then,
              hopefully get to a stage where players can figure out their house layouts and see its resource costs.
            </p>
            <p>
              The housing planner, just like the garden planner, is open-source and other developers can play around with it in the link below.
            </p>
          </div>
        </div>
      </section>
      <section class="collapse bg-base-200 rounded-md mt-4 h-fit collapse-arrow">
        <input type="checkbox">
        <div class="collapse-title text-2xl font-medium">
          Goals
        </div>
        <div class="collapse-content max-w-xl">
          <div class="flex flex-col gap-2">
            <p class="text-sm">
              Leaving this here both as a temp roadmap and so I can remember what I'm doing.
            </p>
            <ul class="list-disc list-inside">
              <li>
                Add porch and door support (currently facing snapping issues)
              </li>

              <li>
                Adjust collision mechanics to imitate in-game behaviour better
              </li>
              <li class="ml-5 text-sm">
                Looking for assistance on this, please send notes to <span class="font-black italic">.aisen</span> on Discord
                if you have images on building interactions/connections.
              </li>
              <li class="ml-5 text-sm">
                Bonus points if you can provide a video or can provide full details on how the collision works.
              </li>
              <li>
                Add other housing add-ons
              </li>
              <li>
                Add a way to save/load house layouts
              </li>
              <li>
                Add mobile support and touch controls
              </li>
              <li>
                Evaluate planner scope/roadmap.
              </li>
              <li class="ml-5 text-sm">
                Furniture/fences/etc. are a lot of work if you think about it.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
