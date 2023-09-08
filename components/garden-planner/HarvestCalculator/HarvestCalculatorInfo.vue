<template>
	<div class="flex flex-col gap-2 py-4 px-2">
	          <div class="max-w-lg">
	            <h5 class="font-bold">
	              Note
	            </h5>
	            <div class="py-2 flex flex-col gap-2">
	              <div class="text-sm">
	                This tool uses information on crops gathered
	                from
	                resources such as Arenvanya's
	                <NuxtLink
	                  href="https://docs.google.com/document/d/1bjqQGwzhW7wsIpSDoO3xCMwqbX7ZbsdsuuXmPEXCrjE/"
	                  target="_blank"
	                  class="items-center gap-1 text-info inline-block"
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
	                  target="_blank" class="inline-block gap-1 text-info"
	                >
	                  <font-awesome-icon
	                    :icon="['fas', 'arrow-up-right-from-square']"
	                    class="text-xs"
	                  />
	                  Math Spreadsheet
	                </NuxtLink>
	                as well as a mix of observations and testings done by fellow Palians discussed on Discord
	              </div>
	              <p class="text-sm font-bold">
	                Final values are still arbitrary and may not reflect your in-game experience.
	              </p>
	            </div>
	            <h5 class="font-bold">
	              How it works (8/9/2023)
	            </h5>
	            <ol class="list-inside list-decimal text-sm">
	              <li>The planner estimates crop yields, factoring in [Quality, Harvest] Boosts, and star seed chance of star crops.</li>
	              <li>Using the provided yields, it calculates the gold value in the form you wish to sell them (Crop/Seed/Preserve)</li>
	            </ol>
	          </div>
	          <div>
	            <h5 class="font-bold">
	              Assumptions (8/9/2023)
	            </h5>
	            <ul class="list-inside list-disc text-sm">
	              <li class="font-semibold">
	                <font-awesome-icon class="text-warning text-sm" :icon="['fas', 'triangle-exclamation']" />
	                Seed/Preserve conversion time is not accounted for.
	              </li>
	              <li class="">
	                <font-awesome-icon class="text-warning text-sm" :icon="['fas', 'triangle-exclamation']" />
	                Weed Chance/Speed Growth are not accounted for due to their unreliable or undocumented behaviour.
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
</template>
