<template>
  <div v-once class="flex flex-col gap-2 py-4 px-2 text-neutral max-h-80">
    <div class="px-2 grid gap-2">
      <div class="bg-accent p-3 rounded-md">
        <h3 class="font-bold text-lg uppercase">
          Note
        </h3>
        <div class="py-2 flex flex-col gap-1">
          <div class="text-sm">
            This tool uses information on crops gathered
            from
            resources such as Arenvanya's
            <NuxtLink
              href="https://docs.google.com/document/d/1bjqQGwzhW7wsIpSDoO3xCMwqbX7ZbsdsuuXmPEXCrjE/"
              target="_blank"
              class="items-center gap-1 text-harvest-boost-dark inline-block font-bold"
            >
              <font-awesome-icon
                :icon="['fas', 'arrow-up-right-from-square']"
                class="text-xs"
              />
              Gardening Guide
            </NuxtLink>
            and their
            <NuxtLink
              to="https://docs.google.com/spreadsheets/d/1YV_LiHp48shNifWakdZtOI9j6_IqQI0A7dRdr28lHNY/"
              target="_blank" class="inline-block gap-1 text-harvest-boost-dark font-bold"
            >
              <font-awesome-icon
                :icon="['fas', 'arrow-up-right-from-square']"
                class="text-xs"
              />
              Math Spreadsheet
            </NuxtLink>
            as well as a mix of observations and testings done by fellow Palians discussed on Discord
          </div>
          <p class="text-sm font-bold text-warning">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-xs" />
            Final values are still arbitrary and may not reflect your in-game experience.
          </p>
        </div>
      </div>
      <div class="bg-accent p-3 rounded-md ">
        <h3 class="font-bold text-lg ">
          How it works (8/9/2023)
        </h3>
        <ol class="list-inside list-decimal text-sm">
          <li>The planner estimates crop yields, factoring in [Quality, Harvest] Boosts, and star chance of crops.</li>
          <li>Using the provided yields, it calculates the gold value in the form you wish to sell them (Crop/Seed/Preserve)</li>
        </ol>
      </div>
    </div>
    <div class="px-2  pb-3">
      <div class="bg-accent grid gap-2 p-3 rounded-md">
        <h5 class="font-bold">
          Assumptions (8/9/2023)
        </h5>
        <ul class="list-inside list-disc text-sm grid gap-1">
          <li class="font-semibold">
            <font-awesome-icon class="text-warning text-sm" :icon="['fas', 'triangle-exclamation']" />
            Seed/Preserve conversion time is not accounted for.
          </li>
          <li class="">
            <font-awesome-icon class="text-warning text-sm" :icon="['fas', 'triangle-exclamation']" />
            Weed Chance is not accounted for due to their unreliable or undocumented behaviour.
          </li>
          <li class="font-bold">
            Speed Growth is underway
          </li>
          <li>
            The player harvests crops on the day they are ready.
          </li>
          <li>
            Crops receive daily watering or has Water Retain.
          </li>
          <li>
            Base quality chance for star seeds is 66%, or as specified in the options.
          </li>
          <li>
            At Gardening level 25, star seeds have a 100% quality chance.
          </li>

          <li>
            Cotton Boost/Quality Up Fertiliser increases quality chance to ~66%.
          </li>
          <li>
            Buffs on crops last until the final calculation day.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
