<script setup lang="ts">
useHead({
  title: 'Roadmap | Palia Garden Planner',
  meta: [
    {
      name: 'description',
      content: 'Content to be worked on in the future',
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://palia-garden-planner.vercel.app/roadmap',
    },
  ],
})
</script>

<template>
  <main v-once class="flex flex-col px-4 py-2 md:px-8 lg:px-16 gap-2 text-justify">
    <NuxtLink to="/" class="flex items-center gap-2 btn w-fit btn-sm btn-ghost">
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="" />
      <p class="">
        Return
      </p>
    </NuxtLink>
    <section class="pb-2">
      <div class="py-4">
        <h1 class="text-2xl font-bold md:text-3xl">
          Garden Planner Roadmap
        </h1>
        <p class="text-xs md:text-sm">
          Last Updated: October 14, 2023
        </p>
      </div>
      <div class="flex flex-col gap-2 text-justify max-w-3xl md:text-base leading-7">
        <div class="card card-compact bg-palia-dark-blue rounded-md max-w-2xl px-4">
          <div class="card-body">
            <p class="leading-6 text-sm">
              <span class="font-bold text-base">Update (October 14):</span>
              I've been working slower than before on the Garden Planner. I'm busy on other things,
              and my hands are recovering from issues I've been having for a while.
            </p>
            <p>
              Planner work will continue at a slightly slower pace,
              no more dates are provided as I've realised I am unlikely to meet them once set.
            </p>
          </div>
        </div>
        <p class="text-justify">
          Hey everyone! The Palia Garden Planner started out as a fun little tool for quickly sharing garden
          layouts
          w/ crop bonuses.
          The first experimental release, however, was met with a lot more enthusiasm and support than I expected.
        </p>
        <p>
          As a result, I'm continuing developing this planner until it reaches a state where I'm happy with it.
          This roadmap is a list of features I plan to add to the planner in the future.
        </p>
      </div>
    </section>
    <div class="divider max-w-xs" />
    <div class="flex flex-col w-full gap-6">
      <section class="pb-2 flex flex-col gap-4  w-full">
        <h2 class="text-2xl font-normal">
          Main Goals
        </h2>

        <div class="flex flex-row flex-wrap gap-4  w-full">
          <RoadmapCard>
            <template #title>
              Presets
            </template>
            <template #description>
              <p>
                A page with a sortable list of garden plans, to help players who need a quick start.
              </p>
            </template>
          </RoadmapCard>

          <RoadmapCard>
            <template #title>
              Crafter Support
            </template>
            <template #description>
              <p>
                Currently, the garden planner does not take into account the processing time of the Seed Collector and
                Preserve Jar.
              </p>
              <p>
                Crafters will be implemented, with the ability to configure the amount of each crafter,
                and then display accurate processing data for each crop.
              </p>
            </template>
          </RoadmapCard>

          <RoadmapCard>
            <template #title>
              Plot System Rewrite
            </template>
            <template #description>
              <p>
                The re-write will allow plots to be partially connected to each other,
                which would be in-line with the game's behaviour.
              </p>
              <p>
                This will expand the planner's capabilities, and will open up the room for more types of gardens.
              </p>
            </template>
          </RoadmapCard>

          <RoadmapCard>
            <template #title>
              House Planner
            </template>
            <template #description>
              <p>
                A separate planner for planning the interior of your house.
              </p>
              <p>
                This will allow you to plan out the major buildings in Palia,
                letting you experiment with different layouts before you build.
              </p>
              <p class="text-warning">
                <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="mr-1" />
                This is a long-term goal, and is unlikely to be implemented for a while.
              </p>
            </template>
          </RoadmapCard>
        </div>
      </section>
      <section class="pb-2 flex flex-col gap-4">
        <div class="grid gap-1">
          <h2 class="text-2xl font-normal">
            Other Goals
          </h2>
          <p class="max-w-3xl">
            These are goals that are being considered but are not set in stone.
            They may be scrapped or ignored depending on how the planner develops.
          </p>
        </div>

        <div class="flex flex-row flex-wrap gap-4 w-full">
          <RoadmapCard>
            <template #title>
              More Export Options
            </template>
            <template #description>
              <p>
                More export options will be added, particularly to text.
                Converting the garden to a markdown layout for example,
                as well as exporting to other garden planners (such as those in google sheets) for users who prefer
                them when/if possible.
              </p>
              <p>
                This will likely be included after the plot system re-write.
              </p>
            </template>
          </RoadmapCard>

          <RoadmapCard>
            <template #title>
              Link Shorteners
            </template>
            <template #description>
              <p>
                Instead of just the code, the planner could store layouts in a database.
                This allows for concise links to be generated, which can be shared with others.
              </p>
              <p>
                This is an uncertain goal, as databases may cost money to host.
              </p>
            </template>
          </RoadmapCard>
        </div>
      </section>
    </div>
  </main>
</template>
