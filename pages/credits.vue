<script setup lang="ts">
useHead({
  title: 'Credits | Palia Garden Planner',
  meta: [
    {
      name: 'description',
      content: 'Credits Page',
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://www.palia-garden-planner.vercel.app/credits',
    },
  ],
})
</script>

<template>
  <main class="flex flex-col gap-2 px-4 py-2 text-justify md:px-8 lg:px-14">
    <NuxtLink to="/" class="flex items-center gap-2 btn w-fit btn-sm btn-ghost">
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="" />
      <p class="">
        Return
      </p>
    </NuxtLink>
    <div class="py-4">
      <h1 class="text-2xl font-bold md:text-3xl">
        Credits
      </h1>
    </div>
    <section class="rounded-md bg-palia-blue bg-opacity-40 sm:p-4">
      <div class="flex flex-col items-center w-full gap-4 p-4 pb-8 rounded-md sm:border sm:border-misc">
        <h2 class="text-2xl">
          Contributors
        </h2>
        <p>
          Thank you to the following people for their assistance to the project!
        </p>
        <div class="flex flex-row flex-wrap justify-center gap-4">
          <CreditName>
            <template #name>
              Arenvanya
            </template>
            <template #for>
              Information
            </template>
          </CreditName>
          <CreditName>
            <template #name>
              Aschefield
            </template>
            <template #for>
              Information, Assets
            </template>
          </CreditName>
          <CreditName>
            <template #name>
              frnkers
            </template>
            <template #for>
              UI Design
            </template>
          </CreditName>
          <CreditName>
            <template #name>
              gazar
            </template>
            <template #for>
              Information
            </template>
          </CreditName>
          <CreditName>
            <template #name>
              Mctalian
            </template>
            <template #for>
              Code Contribution
            </template>
          </CreditName>
          <CreditName>
            <template #name>
              nella
            </template>
            <template #for>
              UI Testing
            </template>
          </CreditName>
          <CreditName>
            <template #name>
              st3fannl
            </template>
            <template #for>
              Assets
            </template>
          </CreditName>
          <CreditName>
            <template #name>
              TinyDragon
            </template>
            <template #for>
              Housing Information
            </template>
          </CreditName>
          <CreditName>
            <template #name>
              Palia Wiki
            </template>
            <template #for>
              Information
            </template>
          </CreditName>
          <CreditName>
            <template #name>
              Paliapedia
            </template>
            <template #for>
              Information, Assets
            </template>
          </CreditName>
        </div>
        <p class="max-w-4xl text-center">
          Huge thanks to the Palia Team and Singularity 6 for developing the game, Palia's Commmunity Teams for various assistance with the planner, and players who provided information through discussions online,
          and everyone for using the planner and providing feedback!
        </p>
      </div>
    </section>
  </main>
</template>
