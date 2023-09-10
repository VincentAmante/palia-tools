<template>
  <main class="flex flex-col px-4 py-2 md:px-8 lg:px-16 gap-2 text-justify">
    <NuxtLink to="/" class="flex items-center gap-2 btn w-fit btn-sm btn-ghost">
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="" />
      <p class="">
        Return
      </p>
    </NuxtLink>
    <section class="pb-2 flex flex-col gap-2">
      <div class="py-4">
        <h1 class="text-2xl font-bold md:text-3xl">
          Garden Planner Changelogs
        </h1>
      </div>

      <div class="collapse collapse-arrow bg-base-200 max-w-2xl">
        <input type="checkbox" checked>
        <h2 class="collapse-title text-xl font-bold">
          September 8, 2023
        </h2>
        <div class="collapse-content flex flex-col gap-6 text-sm md:text-base  leading-6">
          <div class="flex flex-col gap-2">
            <h3 class="font-bold">
              Changes Summary
            </h3>
            <ul class="list-disc list-inside">
              <li>Allowed for illegal plot amounts</li>
              <li>Added external tools</li>
            </ul>
            <p>
              <span class="font-bold">Illegal Plots: </span>Requested feature, part as a way to support increased plot sizes in the future and as a temporary solution to support partially connected layouts.
              This change allows for layouts that exceed the maximum plot count of 9 (as of the current date).
            </p>
            <p>
              <span class="font-bold">External Tools: </span>
              Added external links to other Palia tools, as part of mutual agreements to provide visibility to each other's tools.
              If you're a developer and would like to have your tool added, feel free to contact me on Discord! <span class="font-bold">(.aisen)</span>
            </p>
            <p>
              Recent changes have been slow for various reasons, mostly the development of a small side-project that could be added on here.
              I'll soon return to the roadmap-schedule, potentially updating it to be more accurate.
            </p>
          </div>
        </div>
      </div>

      <div class="collapse collapse-arrow bg-base-200 max-w-2xl">
        <input type="checkbox">
        <h2 class="collapse-title text-xl font-bold">
          September 2, 2023 (Hotfix)
        </h2>
        <div class="collapse-content flex flex-col gap-6 text-sm md:text-base  leading-6">
          <div class="flex flex-col gap-2">
            <h3 class="font-bold">
              Changes Summary
            </h3>
            <ul class="list-disc list-inside">
              <li>Fixed 2 bugs causing seed replants to not be calculated properly</li>
            </ul>
            <p>
              This hotfix tackles a major bug that causes excess seeds to not be properly used in re-plants. It also fixes a bug where re-harvestable plants
              would have incorrect re-plant days when calculated for days above its regular lifespan.
            </p>
            <p>The change should increase gold values by a variable amount and should now properly represent accurate replant deductions</p>
          </div>
        </div>
      </div>

      <div class="collapse collapse-arrow bg-base-200 max-w-2xl">
        <input type="checkbox">
        <h2 class="collapse-title text-xl font-bold">
          August 30, 2023 (Hotfix)
        </h2>
        <div class="collapse-content flex flex-col gap-6 text-sm md:text-base  leading-6">
          <div class="flex flex-col gap-2">
            <h3 class="font-bold">
              Changes Summary
            </h3>
            <ul class="list-disc list-inside">
              <li>Adjusted crops consumed per seed for Tomatoes to match the 0.167 patch changes</li>
              <li>
                Fix to how crops consumed were being calculated that <span class="font-bold">shouldn't make anything different</span>
                (was only a rounding error for tomato seeds caused by the above change)
              </li>
            </ul>

            <p>This change was added hastily, so if any bugs occur please report it to me on Discord <span class="font-bold">(.aisen)</span></p>
          </div>
        </div>
      </div>
      <div class="collapse collapse-arrow bg-base-200 max-w-2xl">
        <input type="checkbox">
        <h2 class="collapse-title text-xl font-bold">
          August 24, 2023
        </h2>
        <div class="collapse-content flex flex-col gap-6 text-sm md:text-base  leading-6">
          <div class="flex flex-col gap-2">
            <h3 class="font-bold">
              Changes Summary
            </h3>
            <ul class="list-disc list-inside">
              <li><span class="italic">New Content —</span> Added Fertiliser</li>
              <li><span class="italic">Technical — </span> Upgraded save codes from v0.1 to v0.2 for fertiliser support</li>
              <li><span class="italic">UI — </span> Shifted garden layout to accomodate fertilisers and be easier on the eyes</li>
              <li><span class="italic">Technical — </span>Removed save code from images exported using the planner</li>
              <li><span class="italic">Technical — </span>Changed how the font is loaded to improve server bandwidth usage</li>
            </ul>
          </div>

          <div class="flex flex-col gap-1">
            <p>
              Today's update adds a core gardening mechanic to the planner - <span class="font-bold">Fertilisers</span>!
              Important for covering tiles that lack necessary bonuses, fertilisers are a great way to enhance your garden.
            </p>
            <p>
              Adding fertilisers required a mild overhaul to how saves function, so I've bumped up the save code version to v0.2 which shortens crop codes to allocate more room for fertiliser codes.
              Your v0.1 codes will still work, just load them in as usual and it'll be parsed correctly (if it doesn't, please report).
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <h3 class="text-lg font-semibold text-left">
              Fertilisers
            </h3>
            <p>
              Added Fertilisers support, fertilisers apply their specific bonus to the tile it's on for every-day that it is active.
              The planner will assume that each tile will have its applied fertiliser daily.
            </p>
            <p>
              Currently,
              <span class="font-bold">there is no cost reductions for having fertilisers</span>
              how fertilisers are acquired vary, and as such their costs are not consistent.
              It's highly likely I'll settle on their sell-price instead, but I'll take some time to decide on that fully.
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <h3 class="text-lg font-semibold text-left">
              v0.2 Saves
            </h3>
            <p class="indent-6">
              New save version includes shortened crop codes, with all crops having their codes reduced by 1 character (except for Cotton).
              Fertilisers are indicated by the dot <span class="border border-solid border-info rounded-lg px-2 font-bold">.</span> prefix, followed by their code.
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
              Outside of that, the new savecode-length makes it impossible to actually store the save in an image file.
              Due to this, I've removed it entirely from exported images.
            </p>
            <p>
              I truly apologise to anyone using smaller screens and anyone who are struggling with the current UI.
              Ease of use is another core aim of the planner, and I'll be working hard to make it better.
            </p>
          </div>
        </div>
      </div>
      <div class="collapse collapse-arrow bg-base-200 max-w-2xl">
        <input type="checkbox">
        <h2 class="collapse-title text-xl font-bold">
          August 22, 2023
        </h2>
        <div class="collapse-content flex flex-col gap-6 text-sm md:text-base  leading-6">
          <div class="flex flex-col gap-2">
            <h3 class="font-bold">
              Changes Summary
            </h3>
            <ul class="list-disc list-inside">
              <li><span class="italic">New Pages:</span> Changelogs and Roadmap</li>
              <li><span class="italic">Technical:</span> Moved website from Vue to Nuxt</li>
              <li><span class="italic">UI:</span> Shifted sections of the website around</li>
              <li><span class="italic">UI:</span> Made some elements smaller to fit better on mobile</li>
              <li><span class="italic">UI:</span> Removed some unnecessary text (just a bit &lt;3)</li>
            </ul>
          </div>

          <div class="flex flex-col gap-1">
            <p>
              Today's update doesn't add much in terms of the planner itself,
              just mostly nerd stuff that might only be interesting to a small amount of people!
            </p>
            <p>
              For the rest of you though, I've added a roadmap and this new changelogs section so you can better keep track of what's going on!
              Accompanying it comes a new sidebar and navbar, which will create room for more pages in the future (Presets/Templates :D).
              <span class="font-bold">Also, since the internal structure of the website has changed, I'd like to ask for reports on any performance issues
                you may encounter, especially on mobile devices.</span>
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <h3 class="text-lg font-semibold text-left">
              New Pages: Changelogs and Roadmap
            </h3>
            <p class="indent-6">
              I've mostly been announcing on the official Palia Discord server whenever I've made a new update to the planner, particularly the
              chill channel for its slow pace.
              It's not really the best place to share updates nor a fitting place for them at all,
              and I'm not interested in making my own Discord server for the planner.
            </p>
            <p class="indent-6">
              These new changelogs and roadmap pages will allow me to better share what's changed and what's coming up in the future,
              not only will they be more accessible to everyone, but I can also write in greater detail. (I will though learn to be more concise in the future.)
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <h3 class="text-lg font-semibold text-left">
              Website Internal Structure
            </h3>
            <p class="indent-6">
              The planner ran on <span class="font-bold italic ">Vue</span>,
              the front-end framework I'm highly familiar working with that lets me develop this client app at a comfortable pace.
              Some of the ideas I have in mind in the long term though would likely benefit from having the planner have server-side capabilities,
              such as an internal link shortener, or an <span class="font-bold">API for other developers to use</span>.
            </p>
            <p class="indent-6">
              Due to that, I've decided to save myself potential future troubles by migrating from Vue to <span class="font-bold italic">Nuxt</span>
              as early as possible before the planner becomes open to the public.
              This also lets me better analyse the website performance of the planner, allowing me to deliver a better experience for you all.
            </p>
            <p>
              These changes took me a while though, I may have also caused some bugs in the migration, so please inform me of anything broke!
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
