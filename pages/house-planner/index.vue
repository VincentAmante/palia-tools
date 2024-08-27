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
    <div class="flex flex-col items-center p-2 pt-4 mb-2 rounded-md bg-water-retain lg:mx-8">
      <div class="flex flex-col gap-1 text-center text-neutral">
        <font-awesome-icon :icon="['fas', 'screwdriver-wrench']" class="text-xl" />
        <h2 class="text-xl font-black">
          Prototype Development Halted Indefinitely
        </h2>
        <p class="max-w-4xl text-sm font-normal">
          This house planner prototype was released primarily as a proof-of-concept and is bound to have inaccuracies.
          Many features are missing and bugs are to be expected.
          <span class="font-bold">
            As of version 0.179, this project's development is halted and is unlikely to support versions beyond 0.179. See below for more info.</span>
          Page will be maintained for archival purposes.
        </p>
      </div>
    </div>
    <ClientOnly>
      <HousePlanner />
    </ClientOnly>

    <section class="px-2 mt-4">
      <div class="flex flex-col items-center justify-center p-4 rounded-md bg-palia-blue outline outline-1 outline-accent">
        <h2 class="pb-3 text-lg font-bold uppercase">
          Controls
        </h2>
        <div class="grid grid-cols-2 gap-4 text-center lg:grid-flow-col">
          <div>
            <kbd class="kbd kbd-lg">Left Click</kbd>
            <p>Select/Place</p>
          </div>
          <div class="grid">
            <kbd class="kbd kbd-lg">Right Click</kbd>
            <p>Clear Selected</p>
          </div>

          <div>
            <kbd class="kbd kbd-lg">Q</kbd>
            <p class="max-w-[12rem]">
              Rotate Left <font-awesome-icon :icon="['fas', 'rotate-left']" class="text-xl" />
            </p>
          </div>

          <div>
            <kbd class="kbd kbd-lg">E</kbd>
            <p class="max-w-[12rem]">
              Rotate Right <font-awesome-icon :icon="['fas', 'rotate-right']" class="text-xl" />
            </p>
          </div>
        </div>
      </div>
    </section>
    <div class="flex flex-col justify-between gap-2 lg:flex-row lg:mx-2">
      <section class="mt-4 rounded-md text-palia-blue-dark collapse h-fit collapse-arrow bg-water-retain">
        <input type="checkbox">
        <div class="text-2xl font-bold collapse-title">
          Why development is halted. <span class="text-sm">(2024-04-24)</span>
        </div>
        <div class="max-w-xl collapse-content">
          <div class="flex flex-col gap-2 font-medium">
            <p class="" />
            <p>
              Since the beginning of this project, the housing system has been a challenge to simulate.
              The project revolved around guesses and asssumptions of how the housing system works, of which many were off the mark.
              This was fine as the prototype was able to accomplish a base level of house-planning that players were able to make use of.
            </p>
            <p>
              As the project constantly rebuilds itself to support the latest and existing features as well as fix existing issues to be more accurate,
              it's clear that the prototype's core systems will not be able to achieve much more than what is currently available.
              <span class="font-bold">
                The main challenge is that I am attempting to emulate the features of a 3D game in a 2D environment.
              </span>
            </p>
            <p>
              After seeing the roadmap, with the upcoming structural blocks and structures involving multiple floors,
              I have decided that future iterations of the house planner is best made with an approach vastly different from the current one.
              As I am unavailable to devote the amount of time I feel I need for this project, development of the <span class="font-italic">house planner</span> will not continue beyond 0.179 for the foreseeable future.
            </p>

            <p>
              <span class="font-bold">My sincerest apologies to anybody who was looking forward to this planner</span>, I was truly excited to make this tool work.
              I hope that someone else would be able to create a better tool for house planning in the future.
              I would also like to thank everyone who has supported this project and provided feedback.
              Perhaps one day I will be able to return to this project with the means to make it work.
            </p>
            <p class="font-bold">
              Regardless, the prototype as-is will remain available, and existing issues will be addressed if possible.
            </p>
          </div>
        </div>
      </section>
      <section class="mt-4 rounded-md collapse bg-base-200 h-fit collapse-arrow">
        <input type="checkbox">
        <div class="text-2xl font-medium collapse-title">
          About the Project (Old)
        </div>
        <div class="max-w-xl collapse-content">
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
      <!-- <section class="mt-4 rounded-md collapse bg-base-200 h-fit collapse-arrow">
        <input type="checkbox">
        <div class="text-2xl font-medium collapse-title">
          Goals
        </div>
        <div class="max-w-xl collapse-content">
          <div class="flex flex-col gap-2">
            <p class="text-sm">
              Leaving this here both as a temp roadmap and so I can remember what I'm doing.
            </p>
            <ul class="list-disc list-inside">
              <li>
                Re-write system to support bay windows in the front of the harvest house. (currently impossible)
              </li>
              <li>
                Improve performance (SUPER laggy right now)
              </li>
              <li>
                <span class="line-through">
                  Fix price calculations (does not account price increase after a certain amount of items)
                </span>
                <span class="ml-2 font-bold">
                  Made to match with wiki prices
                </span>
              </li>
              <li class="line-through">
                Add porch and door support (currently facing snapping issues)
              </li>
              <li>
                Adjust collision mechanics to imitate in-game behaviour better
              </li>
              <li class="ml-5 text-sm">
                Looking for assistance on this, please send notes to <span class="italic font-black">.aisen</span> on Discord
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
      </section> -->
    </div>
  </main>
</template>
