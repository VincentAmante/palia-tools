<template>
  <div v-once class="flex flex-col gap-2 px-2 py-4 text-neutral">
    <div class="grid gap-2 px-2">
      <div class="p-3 rounded-md bg-accent">
        <h3 class="text-lg font-bold uppercase">
          Note
        </h3>
        <div class="flex flex-col gap-1 py-2">
          <div class="text-sm">
            This tool uses information on crops gathered
            from
            resources such as Arenvanya's
            <NuxtLink
              href="https://docs.google.com/document/d/1bjqQGwzhW7wsIpSDoO3xCMwqbX7ZbsdsuuXmPEXCrjE/"
              target="_blank" class="items-center inline-block gap-1 font-bold text-harvest-boost-dark"
            >
              <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xs" />
              Gardening Guide
            </NuxtLink>
            and their
            <NuxtLink
              to="https://docs.google.com/spreadsheets/d/1YV_LiHp48shNifWakdZtOI9j6_IqQI0A7dRdr28lHNY/"
              target="_blank" class="inline-block gap-1 font-bold text-harvest-boost-dark"
            >
              <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xs" />
              Math Spreadsheet
            </NuxtLink>
            as well as a mix of observations and testings done by fellow Palians discussed on Discord
          </div>
          <p class="inline-flex gap-2 p-2 text-sm font-bold border rounded border-misc">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-lg text-warning" />
            Final values are still arbitrary and may not reflect your in-game experience.
          </p>
        </div>
      </div>
      <div class="p-3 rounded-md bg-accent ">
        <h3 class="text-lg font-bold ">
          How it works (8/9/2023)
        </h3>
        <ol class="grid gap-2 text-sm list-decimal list-inside">
          <li class="p-2 border rounded border-misc">
            The planner estimates crop yields, factoring in [Quality, Harvest] Boosts, and star chance of crops.
          </li>
          <li class="p-2 border rounded border-misc">
            Using the provided yields, it calculates the gold value in the form you wish to sell them
            (Crop/Seed/Preserve)
          </li>
        </ol>
      </div>
    </div>
    <div class="px-2 pb-3">
      <div class="grid gap-2 p-3 rounded-md bg-accent">
        <h3 class="text-lg font-bold">
          Assumptions (3/10/2024)
        </h3>
        <ul class="grid gap-2 text-sm ">
          <li class="p-2 border rounded border-misc">
            <span class="font-black">
              Planner Formula for Star Chance:
            </span>
            <p class="p-1 px-2 ml-5 text-white rounded-md bg-neutral w-fit">
              <code>0.25 + (0.25 * useStarSeeds) + (0.02 * level) + (0.5 * hasQualityBoost)</code>
            </p>
            <p class="ml-5">
              Not the actual in-game formula and is based off player observations and personal assumptions.
              Fully debatable and may be tweaked in the future.
            </p>
          </li>
          <li class="p-2 border rounded border-misc">
            <span class="font-black">
              Assumptions that result in the Planner Formula:
            </span>
            <ul class="list-disc list-inside">
              <li class="ml-5">
                Star Seed + Quality Boost stacks up to 100% star chance (hence +50% from quality boost).
              </li>
              <li class="ml-5">
                At level 25, star seeds alone can reach 100% star chance (hence an assumed level scaling).
              </li>
              <li class="ml-5">
                Each level increases star chance by 2% (which reaches a total of 100% at level 25 w/ star seeds).
              </li>
              <li class="ml-5">
                Around level 50 and under, normal seeds alone can reach 100% star chance.
              </li>
              <li class="ml-5">
                Normal seeds always have a chance of star crops (hence an assumed 25% base chance).
              </li>
            </ul>
          </li>
          <li class="p-2 font-semibold border rounded border-misc">
            <font-awesome-icon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
            Seed/Preserve conversion time is not accounted for (yet).
          </li>
          <li class="p-2 font-semibold border rounded border-misc">
            <font-awesome-icon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
            Weed Chance is not accounted for due to their unreliable or undocumented behaviour.
          </li>
          <li class="p-2 border rounded border-misc">
            Crops are harvested on the day they are ready.
          </li>
          <li class="p-2 border rounded border-misc">
            Crops receive daily watering or has Water Retain.
          </li>
          <li class="p-2 border rounded border-misc">
            Crop boosts last until the final calculation day.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
