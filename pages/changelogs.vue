<script setup lang="ts">
useHead({
  title: 'Changelogs | Palia Garden Planner',
  meta: [
    {
      name: 'description',
      content: 'A log of changes made to the Palia Garden Planner',
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://palia-garden-planner.vercel.app/changelogs',
    },
  ],
})
</script>

<template>
  <main v-once class="flex flex-col gap-2 px-2 py-2 text-justify sm:px-4 lg:px-14">
    <NuxtLink to="/" class="flex items-center gap-2 btn w-fit btn-sm btn-ghost">
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="" />
      <p class="">
        Return
      </p>
    </NuxtLink>
    <section class="flex flex-col gap-2 pb-2">
      <div class="py-4">
        <h1 class="text-2xl font-bold md:text-3xl">
          Garden Planner Changelogs
        </h1>
      </div>

      <div class="grid gap-2">
        <ChangelogItem checked>
          <template #title>
            March 10, 2024 — New Star Chance Formula
          </template>
          <template #summary>
            <li>
              <span class="italic">New Level System —</span> Added new formula for calculating star chance
            </li>
            <li class="ml-5">
              Removed chance override options in favour of the new formula
            </li>
            <li>
              <span class="italic">Small UI Update —</span> Tweaked buttons to be more compact.
            </li>
          </template>
          <template #default>
            <p>
              New attempt at a level-based star-chance system, this time with a formula that can adapt to any level
              instead of just level 25.
              This change was originally intended to be part of the crafter update,
              but since that won't be out for a while (busy reasons, see Jan 30 update) I've decided to release that
              change now.
            </p>

            <p class="p-1 px-3 font-mono rounded-md bg-palia-blue">
              Formula:
              <code class="">0.25 + (0.25 * useStarSeeds) + (0.02 * level) + (0.5 * hasQualityBoost)</code>
            </p>
            <p class="text-sm">
              See Harvest Calculator Info > Assumptions for brief explanation
            </p>

            <p>
              This new formula is arbitrary and based off player observations, and is still not the actual in-game
              formula.
              Level 25+ players using star seeds shouldn't notice any difference from the old system provided the same
              settings are used. Pre-level 25 star-seed layouts should expect the same settings as a level 0.
            </p>
            <p>
              For players not using star seeds, the new system should hopefully provide a slightly more accurate
              representation of their star chance. Most notably, when you reach level 50, you should expect a 100%
              star chance with normal seeds. 100% is actually met earlier on at around level 38 as per the planner,
              whether that's accurate to in-game is debatable, but nevertheless should still be closer than the old
              formula.
            </p>
            <div class="divider" />
            <p>
              Minor UI tweaks in preparation of an internal UI update, as well as minor experimentation with making
              the planner more compact.
            </p>
            <p>
              UI changes are planned for the next major update (no ETA), with a specific focus to the harvest
              calculator.
              Many of my issues with the incoming updating has been the lack of space to fit everything in,
              so I'm making a smaller UI update to make the calculator more bearable to look at.
              In addition, I might look at better ways to display the crop/fertiliser buttons, as the increase of crops
              is going to make the buttons more cluttered.
            </p>
            <p>
              If you notice anything wrong, please report it to me on Discord <span class="font-bold">(.aisen)</span>
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            January 30, 2024 — New Crops, New Building
          </template>
          <template #summary>
            <li>
              <span class="italic">New Crops —</span> Added new crops from the 0.176 patch
            </li>
            <li class="ml-5">
              <span>HOTFIX: Bok choy star seed price was incorrectly valued at 30 gold instead of the right amount of 22
                (Credits: gazar)</span>
            </li>
            <li>
              <span class="italic">New Building —</span> Added the new bay window housing add-on
            </li>
            <li class="ml-5 font-bold">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-warning" />
              <span>
                NOTE: Bay Windows on the front of the Harvest House are not yet supported, it'll require a system
                re-write.
              </span>
            </li>
          </template>
          <template #default>
            <p>
              Hello everyone! This was a bit of a quick addition.
              Huge thanks to <span class="italic font-bold">Aschefield</span> and <span class="italic font-bold">Adain
                (Paliapedia)</span> for providing information and assets on the new crops and by-products!
              Their help certainly sped up syncing the planner with the new patch.
            </p>
            <p>
              There may be a chance I missed some values, so if you notice any discrepancies please do report it to me
              on Discord <span class="font-bold">(.aisen)</span>.
              Those of you who are using the House Planner may note an issue with the Bay windows, I'll need to re-work
              how the planner handles housing add-ons to support it so it would definitely take awhile.
            </p>
            <p>
              Apologies once more for the slow updates, I've been busy :(
              Please note that anyone willing to make alternative websites or improve on this one is more than welcome
              to do so.
              I'm currently searching for a job, so I'm not sure how much time I'll have to work on this.
              Consider updates to be much slower from now on until the situation changes.
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            November 13, 2023 — Mild Bugfixes
          </template>
          <template #summary>
            <li>
              House Planner
            </li>
            <li>
              <span class="ml-5">Experimental Release</span> - Added a proof of concept house planner: <NuxtLink
                class="link" to="/house-planner"
              >
                Link Here
              </NuxtLink> (Warning: Heavily early stage, not recommended for regular use)
            </li>
            <li class="ml-5">
              <span class="italic">Bugfix</span> - Prevented hallways from connecting at the sides
            </li>
            <li class="ml-5">
              <span class="italic">Adjustment</span> - Gave most buildings a vertical roof for collision checks
            </li>
            <li>
              <span class="italic">UI</span> - Slightly tweaked UI for smaller screens and wider gardens
            </li>
            <li>
              <span class="italic">Compact View (Experimental)</span> - Added experimental compact view to support a
              potential feature on another website that's not mine to announce :D
            </li>
            <li class="ml-5">
              See here: <NuxtLink class="link" to="/compact">
                Compact View
              </NuxtLink>
            </li>
            <li class="font-bold uppercase">
              Update regarding crafters below
            </li>
          </template>

          <template #default>
            <p>
              Heya folks, small update this time round with a small focus on features unrelated to the garden planner.
            </p>
            <p>
              I've worked on the layout for the planner a bit, hopefully to support larger gardens and smaller screens a
              little.
              I meant to add a fix to the screenshot feature but it did not pan out.
            </p>
            <div class="divider" />
            <h3 class="text-lg font-bold">
              Crafter Support
            </h3>
            <p>
              Crafters are under construction! Files for them exist somewhere in the background.
              they support having limited slots and can properly calculate time spent processing
              regardless of the different crops inserted into each one.
              Information with and without idle time is also available.
            </p>
            <p>
              Not much work left on the crafters themselves as they're almost functional.
              The big problem is how they'll be managed and displayed.
              I intend to support the ability to calculate for total processing time
              given a number of crafters.
              Every crafter <span class="italic">will</span> support having different crops placed into each one.
            </p>
            <p>
              I have been mind-blocked on both how to manage and configure the crafters in a way that can reflect
              multiple
              playstyles.
              Not to mention that on release it'll likely need configuration saving and sharing, which is a whole other
              can of worms.
              Overall though, work is progressing on them, I hope to release them in a state that's satisfying.
            </p>
            <p>
              However, to make sure I implement them right, I plan on releasing them in an experimental page first.
              This was where the house planner came in, as a way to gauge how users react to experimental features.
            </p>
            <div class="divider" />
            <h3 class="text-lg font-bold">
              House Planner
            </h3>
            <p>
              The house planner is a proof of concept, and is not meant to be used regularly.
              Aside from being a way to gauge how users react to experimental features,
              it's also a highly demanded project that I've been wishing someone else would make.
              Since it's been months and I needed a change of gear to work on, I decided to make it myself.
            </p>
            <p>
              It's currently in it's early stages, and is currently not a reliable source of information on housing.
              It has a lot of inaccuracies, and is missing a lot of information.
              That said, having this out there will let me test for bugs much earlier,
              as I personally do not have the resources and space to test for housing.
            </p>
            <p>
              Hopefully, this will also encourage other developers to either improve on this or make their own versions.
              Otherwise, this opens up a new end goal of being the one-stop shop for simulating certain Palia mechanics.
            </p>
            <p>
              You may try it out yourself here: <NuxtLink class="link" to="/house-planner">
                House Planner
              </NuxtLink>
            </p>
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            October 15, 2023 — UI Rework
          </template>
          <template #summary>
            <li><span class="italic">UI Rework —</span> Reworked the UI to be more compact and reduce scrolling</li>
            <li><span class="italic">Palia Clock —</span>Adds an in-game timer for convenience</li>
            <li><span class="italic">Mechanic —</span> Added growth boost support (options)</li>
            <li>UX Improvements:</li>
            <ul class="pl-3 list-disc list-inside ">
              <li>You can drag crops/fertilisers to their tile</li>
              <li>You can now click on the save codes to copy to clipboard</li>
              <li>
                <span class="italic">(Desktop) —</span> Hovering over a tile now previews the crop/fertiliser being
                placed
              </li>
              <li>Main options now save automatically per browser</li>
            </ul>
            <li>Moved Credits to its own dedicated page</li>
            <li>Renamed approximations data to more accurately reflect the lack of crafter timings</li>
            <li>HOTFIX — Fixed issue with tomatoes when under growth boost</li>
          </template>
          <template #default>
            <p class="py-4 text-sm text-warning">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="" />
              UI using custom layouts is not final, and will be changed soon.
            </p>
            <p>
              This change is a major UI rework, with the aim of reducing scrolling and making the planner more compact.
              The initial design of the planner was added as an after-thought, and was not meant to be a long-term
              solution.
              Adding new features, and planning out future ones was proving to be a hassle with the current design, so I
              prioritised its re-work.
            </p>
            <p>
              The rework is designed by an amazing friend of mine, <span class="font-bold">frnkers</span>, and was
              translated to code by yours truly.
              This change allows me to comfortably add new features, and plan out future ones without worrying about the
              messiness of the UI.
            </p>
            <div class="divider my-0 w-full mx-auto max-w-[16rem] lg:max-w-sm" />
            <p>
              I've also added a couple new features, an in-game timer and growth boost support.
              Growth boost support is a toggle in the options menu as it's still bugged (and may work differently with
              fertilisers which is still untested),
              a lot of thanks to <span class="font-bold">gazar</span> for providing information regarding this mechanic.
            </p>
            <p>
              The in-game timer is a small nifty addition that mimics the in-game clock.
              I've initially added a 6 AM alarm (for harvests) but it was proving to be buggy due to how web
              notifications
              work.
              The alarm feature will be kept on the shelf until I find a better system for alarms.
            </p>
            <div class="divider my-0 w-full mx-auto max-w-[16rem] lg:max-w-sm" />
            <p>
              Overall, this update is late as I've taken a break.
              Health reasons and being busy with other stuff meant I couldn't follow my initial roadmap.
              I'm still working on the planner, but it'll be at a slower pace now and I'll be developing the planner
              at a more comfortable pace.
            </p>
            <p>
              If you ever want to contribute to the project's development, just know that the website is open-source and
              can be accessed in the footer below!
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            September 21, 2023 (Hotfix)
          </template>
          <template #summary>
            <li>Fixed price of corn preserves (Issue #31 - agazarkiewicz)</li>
          </template>
          <template #default>
            Prices of corn preserves were set to that of potato preserves, causing an overestimation of gold values.
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            September 15, 2023 (Hotfix)
          </template>
          <template #summary>
            <li>Adjusted seeds for 0.168.1 hotfix</li>
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            September 13, 2023 (Hotfix)
          </template>
          <template #summary>
            <li>Added corn and spicy pepper</li>
            <li>Fixed bug where remainders weren't being properly calculated in the planner</li>
            <li>Fixed huge oversight where bushes gave 4 crops per harvest when it actually gives 6</li>
          </template>
          <template #default>
            This hotfix adds the new crops added in the 0.168 patch.
            It also fixed some incorrect values that I've not detected for a long time.
            If you notice discrepancies in your harvest/gold values, please do report it to me on Discord <span
              class="font-bold"
            >(.aisen)</span>
            as I tend to miss some values while working on the planner.
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            September 8, 2023
          </template>
          <template #summary>
            <li>Allowed for illegal plot amounts</li>
            <li>Added external tools</li>
          </template>
          <template #default>
            <span class="font-bold">Illegal Plots: </span>Requested feature, part as a way to support increased plot
            sizes
            in the future and as a temporary solution to support partially connected layouts.
            This change allows for layouts that exceed the maximum plot count of 9 (as of the current date).
            <br>
            <span class="font-bold">External Tools: </span>
            Added external links to other Palia tools, as part of mutual agreements to provide visibility to each
            other's
            tools.
            If you're a developer and would like to have your tool added, feel free to contact me on Discord! <span
              class="font-bold"
            >(.aisen)</span>
            <br>
            Recent changes have been slow for various reasons, mostly the development of a small side-project that could
            be added on here.
            I'll soon return to the roadmap-schedule, potentially updating it to be more accurate.
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            September 2, 2023 (Hotfix)
          </template>
          <template #summary>
            <li>Fixed 2 bugs causing seed replants to not be calculated properly</li>
          </template>
          <template #default>
            This hotfix tackles a major bug that causes excess seeds to not be properly used in re-plants. It also fixes
            a
            bug where re-harvestable plants
            would have incorrect re-plant days when calculated for days above its regular lifespan.
            <br>
            The change should increase gold values by a variable amount and should now properly represent accurate
            replant
            deductions
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            August 30, 2023 (Hotfix)
          </template>
          <template #summary>
            <li>Adjusted crops consumed per seed for Tomatoes to match the 0.167 patch changes</li>
            <li>
              Fix to how crops consumed were being calculated that <span class="font-bold">shouldn't make anything
                different</span>
              (was only a rounding error for tomato seeds caused by the above change)
            </li>
          </template>
          <template #default>
            This change was added hastily, so if any bugs occur please report it to me on Discord <span
              class="font-bold"
            >(.aisen)</span>
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            August 24, 2023
          </template>
          <template #summary>
            <li><span class="italic">New Content —</span> Added Fertiliser</li>
            <li>
              <span class="italic">Technical — </span> Upgraded save codes from v0.1 to v0.2 for fertiliser support
            </li>
            <li>
              <span class="italic">UI — </span> Shifted garden layout to accomodate fertilisers and be easier on the
              eyes
            </li>
            <li><span class="italic">Technical — </span>Removed save code from images exported using the planner</li>
            <li>
              <span class="italic">Technical — </span>Changed how the font is loaded to improve server bandwidth usage
            </li>
          </template>
          <template #default>
            <div class="flex flex-col gap-1">
              <p>
                Today's update adds a core gardening mechanic to the planner - <span
                  class="font-bold"
                >Fertilisers</span>!
                Important for covering tiles that lack necessary bonuses, fertilisers are a great way to enhance your
                garden.
              </p>
              <p>
                Adding fertilisers required a mild overhaul to how saves function, so I've bumped up the save code
                version
                to v0.2 which shortens crop codes to allocate more room for fertiliser codes.
                Your v0.1 codes will still work, just load them in as usual and it'll be parsed correctly (if it
                doesn't,
                please report).
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-left">
                Fertilisers
              </h3>
              <p>
                Added Fertilisers support, fertilisers apply their specific bonus to the tile it's on for every-day that
                it is active.
                The planner will assume that each tile will have its applied fertiliser daily.
              </p>
              <p>
                Currently,
                <span class="font-bold">there is no cost reductions for having fertilisers</span>
                how fertilisers are acquired vary, and as such their costs are not consistent.
                It's highly likely I'll settle on their sell-price instead, but I'll take some time to decide on that
                fully.
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-left">
                v0.2 Saves
              </h3>
              <p class="indent-6">
                New save version includes shortened crop codes, with all crops having their codes reduced by 1 character
                (except for Cotton).
                Fertilisers are indicated by the dot <span
                  class="px-2 font-bold border border-solid rounded-lg border-info"
                >.</span> prefix, followed by their
                code.
              </p>
              <p>
                As a core feature of the Garden Planner is 'Shareability',
                v0.1 codes are supported to ensure nobody's gardens are lost during the upgrade.
                Ideally, all codes will not be invalidated in the future,
                and will only be unsupported if gardening mechanics change to the point it becomes impossible.
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-left">
                UI/UX Changes and Other Stuff
              </h3>
              <p class="indent-6">
                The garden layout has been shifted to the right to accomodate fertilisers.
                Most elements were mostly shifted to make the high amount of information more bearable to look at.
                The current UI/UX of the app is showing a lot of flaws.
                A graphic designer friend of mine has offered to work on a better design when available,
                so a UI/UX re-design might not be far in the future.
              </p>
              <p>
                Outside of that, the new savecode-length makes it impossible to actually store the save in an image
                file.
                Due to this, I've removed it entirely from exported images.
              </p>
              <p>
                I truly apologise to anyone using smaller screens and anyone who are struggling with the current UI.
                Ease of use is another core aim of the planner, and I'll be working hard to make it better.
              </p>
            </div>
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            August 22, 2023
          </template>
          <template #summary>
            <li><span class="italic">New Pages:</span> Changelogs and Roadmap</li>
            <li><span class="italic">Technical:</span> Moved website from Vue to Nuxt</li>
            <li><span class="italic">UI:</span> Shifted sections of the website around</li>
            <li><span class="italic">UI:</span> Made some elements smaller to fit better on mobile</li>
            <li><span class="italic">UI:</span> Removed some unnecessary text (just a bit &lt;3)</li>
          </template>
          <template #default>
            <div class="flex flex-col gap-1">
              <p>
                Today's update doesn't add much in terms of the planner itself,
                just mostly nerd stuff that might only be interesting to a small amount of people!
              </p>
              <p>
                For the rest of you though, I've added a roadmap and this new changelogs section so you can better keep
                track of what's going on!
                Accompanying it comes a new sidebar and navbar, which will create room for more pages in the future
                (Presets/Templates :D).
                <span class="font-bold">Also, since the internal structure of the website has changed, I'd like to ask
                  for
                  reports on any performance issues
                  you may encounter, especially on mobile devices.</span>
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-left">
                New Pages: Changelogs and Roadmap
              </h3>
              <p class="indent-6">
                I've mostly been announcing on the official Palia Discord server whenever I've made a new update to the
                planner, particularly the
                chill channel for its slow pace.
                It's not really the best place to share updates nor a fitting place for them at all,
                and I'm not interested in making my own Discord server for the planner.
              </p>
              <p class="indent-6">
                These new changelogs and roadmap pages will allow me to better share what's changed and what's coming up
                in the future,
                not only will they be more accessible to everyone, but I can also write in greater detail. (I will
                though
                learn to be more concise in the future.)
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-left">
                Website Internal Structure
              </h3>
              <p class="indent-6">
                The planner ran on <span class="italic font-bold ">Vue</span>,
                the front-end framework I'm highly familiar working with that lets me develop this client app at a
                comfortable pace.
                Some of the ideas I have in mind in the long term though would likely benefit from having the planner
                have
                server-side capabilities,
                such as an internal link shortener, or an <span class="font-bold">API for other developers to
                  use</span>.
              </p>
              <p class="indent-6">
                Due to that, I've decided to save myself potential future troubles by migrating from Vue to <span
                  class="italic font-bold"
                >Nuxt</span>
                as early as possible before the planner becomes open to the public.
                This also lets me better analyse the website performance of the planner, allowing me to deliver a better
                experience for you all.
              </p>
              <p>
                These changes took me a while though, I may have also caused some bugs in the migration, so please
                inform
                me of anything broke!
              </p>
            </div>
          </template>
        </ChangelogItem>
      </div>
    </section>
  </main>
</template>
