<template>
  <div v-once
    class="flex flex-col gap-2 px-2 py-4 text-accent bg-palia-blue-dark rounded-lg overflow-auto scrollbar-thumb-accent max-h-132">
    <p class="px-2 text-xl font-black">Info</p>
    <div class="grid gap-2 px-2">
      <div class="p-3 rounded-md bg-palia-blue">
        <h3 class="text-lg font-bold">
          Note
        </h3>
        <div class="flex flex-col gap-1 py-2">
          <div class="text-sm">
            This tool uses information on crops gathered
            from
            resources such as Arenvanya's
            <NuxtLink href="https://docs.google.com/document/d/1bjqQGwzhW7wsIpSDoO3xCMwqbX7ZbsdsuuXmPEXCrjE/"
              target="_blank" :prefetch="false"
              class="items-center inline-block gap-1 font-bold text-harvest-boost-dark hover:underline underline-offset-2">
              <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xs" />
              Gardening Guide
            </NuxtLink>
            and their
            <NuxtLink to="https://docs.google.com/spreadsheets/d/1YV_LiHp48shNifWakdZtOI9j6_IqQI0A7dRdr28lHNY/"
              target="_blank" :prefetch="false"
              class="inline-block gap-1 font-bold text-harvest-boost-dark hover:underline underline-offset-2">
              <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xs" />
              Math Spreadsheet
            </NuxtLink>
            as well as a mix of observations and testings done by fellow Palians discussed on Discord
          </div>
          <p class="inline-flex gap-2 p-2 text-sm bg-warning text-neutral rounded-sm w-fit">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-lg text-neutral" />
            Final values are estimations and may not reflect actual in-game experience.
          </p>
        </div>
      </div>

      <div class="p-3 rounded-md bg-palia-blue ">
        <h3 class="text-lg font-bold ">
          Glossary
        </h3>
        <p class="text-sm pt-2">List of terms used in the planner. Some of these terms are used primarily within the planner for differentiating similar values.</p>
        <ol class="list">
          <li class="list-row">
            <p>
              <span class="font-bold">Growth Tick</span> — In-game (Palian) day that has passed for the user.
              Growth ticks elapse during 6:00 AM and either advances only while the player is logged on or advances a
              maximum of one time after the player logs off.
            </p>
          </li>
          <li class="list-row">
            <p>
              <span class="font-bold">Earth Time</span> — Time in the real world / outside the game. Earth time means that the associated time is capable of passing even if the player is logged off.
            </p>
          </li>
          
          <li class="list-row">
            <p>
              <span class="font-bold">Harvest / Harvest Day</span> — A day where a crop is ready for harvest, typically also replanted within the day if required.
            </p>
          </li>

          <li class="list-row">
            <p>
              <span class="font-bold">Cycle</span> — Some crops take multiple harvests before needing a re-plant (Such as Blueberries).
              A cycle factors in the harvests between each replant.
            </p>
          </li>
          <li class="list-row">
            <p>
              <span class="font-bold">Overall</span> — The entire length of growth ticks / palian days that the planner accounts for.
              This is the amount of growth ticks seen in the overview display as well as the number of days within the setting.
            </p>
          </li>
        </ol>
      </div>
      <div class="p-3 rounded-md bg-palia-blue ">
        <h3 class="text-lg font-bold ">
          How it works - Summary <span class="tabular-nums text-xs pl-1 opacity-50">(13/05/2025)</span>
        </h3>
        <ol class="list">
          <li class="list-row">
            <div class="font-thin opacity-30 tabular-nums hidden xs:block">01</div>
            The planner estimates crop yields, factoring in [Quality, Harvest] Boosts, and star chance of crops.
          </li>
          <li class="list-row">
            <div class="font-thin opacity-30 tabular-nums hidden xs:block">02</div>
            Using the provided yields, it processes the crops into the form in which you wish to sell them
            (Crop/Seed/Preserve)
          </li>
          <li class="list-row">
            <div class="font-thin opacity-30 tabular-nums hidden xs:block">03</div>
            Finally, it calculates the gold value of everything once processes are factored in
          </li>
        </ol>
      </div>
    </div>
    <div class="px-2">
      <div class="grid gap-2 p-3 rounded-md bg-palia-blue">
        <h3 class="text-lg font-bold">
          Harvest Assumptions <span class="tabular-nums text-xs pl-1 opacity-50">(14/05/2025)</span>
        </h3>
        <ul class="list text-sm">
          <li class="list-row">
            <div class="font-thin opacity-30 tabular-nums hidden xs:block">01</div>
            <span class="font-black">
              Planner Formula for Star Chance:
            </span>
            <div class="list-col-wrap">
              <p class=" text-white rounded-md bg-neutral w-fit p-2">
                <code>0.25 + (0.25 * useStarSeeds) + (0.02 * level) + (0.5 * hasQualityBoost)</code>
              </p>
              <p class="w-full">
                Not the actual in-game formula and is based off player observations and personal assumptions.
                Fully debatable and may be tweaked in the future.
              </p>
            </div>
          </li>
          <li class="list-row">
            <div class="font-thin opacity-30 tabular-nums hidden xs:block">02</div>
            <span class="font-black">
              Assumptions that result in the Planner Formula:
            </span>
            <div class="list-col-wrap">
              <ul class="list-disc list-inside flex flex-col gap-1">
                <li class="">
                  Star Seed + Quality Boost stacks up to 100% star chance (hence +50% from quality boost).
                </li>
                <li class="">
                  At level 25, star seeds alone can reach 100% star chance (hence an assumed level scaling).
                </li>
                <li class="">
                  Each level increases star chance by 2% (which reaches a total of 100% at level 25 w/ star seeds).
                </li>
                <li class="">
                  Around level 50 and under, normal seeds alone can reach 100% star chance.
                </li>
                <li class="">
                  Normal seeds always have a chance of star crops (An assumed 25% base chance).
                </li>
              </ul>
            </div>
          </li>
          <li class="list-row">
            <div class="font-thin opacity-30 tabular-nums hidden xs:block">03</div>
            <span class="font-black">
              Other Crop Assumptions
            </span>
            <div class="list-col-wrap">
              <ul class="list-disc list-inside flex flex-col gap-1">
                <li class="">
                  <font-awesome-icon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
                  Weed Chance is not accounted for due to their unreliable or undocumented behaviour.
                </li>
                <li class="">
                  Crops are harvested on the day they are ready.
                </li>
                <li class="">
                  Crops receive daily watering or has Water Retain.
                </li>
                <li class="">
                  Crop boosts last until the final calculation day.
                </li>
                <li class="">
                  If Replant Costs are enabled, crops will be deducted from within the day.
                  This may sometimes result in a harvest having negative values
                </li>
                <li class="pl-5">
                  These harvests with a negative value merely imply that a crop was taken from somewhere else, whether
                  your storage
                  or from a different harvest. Aside from required seed calculations, each harvest day does not factor
                  in outcomes from other days
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="px-2 pb-3">
      <div class="grid gap-2 p-3 rounded-md bg-palia-blue">
        <h3 class="text-lg font-bold">
          Processing Mechanics <span class="tabular-nums text-xs pl-1 opacity-50">(14/05/2025)</span>
        </h3>
        <ul class="list text-sm">

          <li class="list-row">
            <div class="font-thin opacity-30 tabular-nums hidden xs:block">01</div>
            <span class="font-black">
              Crop distribution
            </span>
            <div class="list-col-wrap">
              <ul class="list-disc list-inside flex flex-col gap-1">
                <li>
                  On harvest, crops for processing will be immediately sent to their assigned crafters when available
                </li>
                <li>
                  Crops are grouped & divided based on how many is required for a conversion (e.g Apples are grouped by
                  10 for seeding)
                </li>
                <li>
                  In an ideal scenario, these groups are divided to the assigned crafters equally
                </li>
                <li>
                  If there are crafters that are still processing by the next harvest, it is assumed the player will
                  distribute these groups
                  based on the most available crafters
                </li>
                <li>
                  The planner does not factor in storage limit for crafters, assuming the player will insert once there
                  is room
                </li>
              </ul>
            </div>
          </li>
          <li class="list-row">
            <div class="font-thin opacity-30 tabular-nums hidden xs:block">02</div>
            <span class="font-black">
              Crop Fragments
            </span>
            <div class="list-col-wrap">
              <ul class="list-disc list-inside flex flex-col gap-1">
                <li>
                  If there are not enough crops for a conversion, they will still be included as fragment groups
                </li>
                <li>
                  Fragment groups operate under the assumption that they will build up over time into full processes.
                </li>
                <li>
                  As they may take an unknown number of harvest/cycles to be complete, the planner does not wait for
                  them to be
                  complete groups.
                </li>
                <li>
                  Crop fragments are factored in on time and gold calculations
                </li>
                <li>
                  In the ideal scenario where crop groups are divided evenly, they're assigned to the most available
                  crafter
                </li>
              </ul>
            </div>
          </li>
          <li class="list-row">
            <div class="font-thin opacity-30 tabular-nums hidden xs:block">03</div>
            <span class="font-black">
              Time Calculations
            </span>
            <div class="list-col-wrap">
              <ul class="list-disc list-inside flex flex-col gap-1">
                <li>
                  Processing time is calculated based on crafter distribution and harvest time
                </li>
                <li>
                  The overall processing time attempts to estimate the 'shortest possible time' to process everything
                </li>
                <li>
                  Once crafters are divided equally, the crafter with the longest processing time will be used to
                  calculate the overall time.
                </li>
                <li>
                  If the busiest crafter will finish before the next harvest, the remaining 'idle' time is included
                </li>
                <li>
                  When there is known to be excess time (a crafter still processing beyond the next harvest), we instead
                  calculate the total conversions that can be done within the
                  harvest (how many processes can be done based on time to next harvest & crafter amount), and subtract
                  it from the conversions required. We then use this to calculate the average excess
                  time
                  <p class=" text-white rounded-md bg-neutral w-fit p-2 font-mono slashed-zero tabular-nums">
                    <code>averageExcessTimeMinutes = ((conversionsRequired - conversionsPossible) * minutesPerConversion) / crafterCount</code>
                  </p>
                </li>
                <li>
                  This method is only used for all in-between harvests, operating under the aforementioned assumption
                  that the player
                  will distribute crop groups based on the most available one
                </li>

                <li>
                  Average excess time only applies to in-between harvests.
                  The first harvest assumes all crafters are empty.
                  The last harvest not using average excess time is more arbitrary,
                  believing that by the last harvest, crops have been distributed evenly enough that using the time of
                  the longest busiest again is more accurate
                </li>
              </ul>
            </div>
          </li>
          <li class="list-row">
            <div class="font-thin opacity-30 tabular-nums hidden xs:block">04</div>
            <span class="font-black">
              Negative Values
            </span>
            <div class="list-col-wrap">
              <ul class="list-disc list-inside flex flex-col gap-1">
                <li>
                  Negative values may be encountered when 'Replant Costs' is enabled
                </li>
                <li>
                  These negative values are the result of negative harvest crops mentioned in the Harvest section
                </li>
                <li>
                  Since other harvests are not deducted due to planner mechanics,
                  these values seek to 'balance' other harvests having extra produce that would've been deducted
                </li>
                <li>
                  This implementation may be faulty, so I do seek feedback on this
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
