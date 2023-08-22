<template>
  <main class="flex flex-col px-4 py-2 md:px-8 lg:px-16 gap-2 text-justify">
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
          Last Updated: August 22, 2023
        </p>
      </div>
      <div class="flex flex-col gap-2 text-justify text-sm max-w-3xl md:text-base leading-10">
        <p class="text-sm text-justify">
          Hey everyone! The Palia Garden Planner started out as a fun little tool for quickly sharing garden
          layouts
          w/ crop bonuses.
          The first experimental release, however, was met with a lot more enthusiasm and support than I expected.
        </p>
        <p class="text-sm">
          As such, I've decided to raise the scope of what the planner will accomplish.
          There's a lot to do and there's a lot of requested features that I want to implement.
          This roadmap exists so you can now what's likely to come up next and what's planned for the future.
          I'll follow it as closely as I can, but some features may be prioritised as there's a lot of factors I
          may not have considered.
        </p>
      </div>
    </section>
    <div class="divider max-w-xs" />
    <section class="pb-2 max-w-3xl flex flex-col gap-4">
      <h2 class="text-2xl font-normal">
        Main Goals
      </h2>

      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox">
        <div class="collapse-title text-xl">
          Open Sourcing
        </div>
        <div class="collapse-content flex flex-col gap-2">
          <div class="py-2">
            <p class="text-sm italic">
              ETA: End of Week - Before end of August
            </p>
          </div>
          <p>
            I've planned to do this sooner, but the harvest approximation tool took a lot longer than I
            expected.
            The source code of the garden planner will be made available on GitHub,
            and anyone will be free to modify or even make variations of the project.
          </p>
          <p>
            Right now it's delayed because this will be my first open-source project.
            I want to clean things up a bit and research on how this works before I make it public.
          </p>
        </div>
      </div>

      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox">
        <div class="collapse-title text-xl">
          Presets
        </div>
        <div class="collapse-content flex flex-col gap-2">
          <div class="py-2">
            <p class="text-sm italic">
              ETA: Near end of August - First week of September
            </p>
          </div>
          <p>
            Creating a garden layout from scratch can be a bit daunting, especially if you're new to the game.
            As such, I'm introducing some starter layouts so that you can quickly get started with your garden.
          </p>
          <p>
            The first batch of presets will be aimed towards players
            who are either new or unfamiliar to gardening.
            All presets will either be self-created, or (more likely) added with permission by another player.
            Each preset will contain some quick statistics about the layout, such as bonus coverage and gold
            valuation.
            Included will also be a small description as to how to use the layout provided by the creator.
          </p>
        </div>
      </div>

      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox">
        <div class="collapse-title text-xl">
          Fertilisers & v0.2 Codes
        </div>
        <div class="collapse-content flex flex-col gap-2">
          <div class="py-2">
            <p class="text-sm italic">
              ETA: As soon as possible
            </p>
          </div>
          <p>
            Technically, this is actually the easiest to implement. So expect it to probably come sooner than
            one of the other goals.
            As fertilisers are a core part of gardening,
            they're highly prioritised and will be released as quickly as I can.
            The only complication with them is making them save-compatbile... in comes the v0.2 codes.
          </p>

          <p class="font-semibold">
            v0.2 Codes
          </p>
          <p>
            The v0.2 codes will be a mild improvement of the current v0.1 codes.
            Most crop codes such as Tomato <span class="italic">(To)</span> will be shortened to 1-letter <span
              class="italic"
            >(T)</span>, with likely Cotton retaining its code <span
              class="italic"
            >(Co)</span>.
            The main difference is that the v0.2 codes will also include fertiliser information alongside the
            crop.
            By shortening most of the crop codes, this will make the addition of fertiliser information somewhat
            less intimidating.
          </p>
          <p>
            <span class="font-bold">v0.1 codes will still be supported.</span>
            They will remain usable, and will simply create a garden layout without fertilisers.
            I aim to have all save codes be backwards compatible for the user's convenience, hence why each
            save version has to be carefully thought out before implementing.
          </p>
        </div>
      </div>

      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox">
        <div class="collapse-title text-xl">
          Full support of Seed Collectors & Preserve Jar
        </div>
        <div class="collapse-content flex flex-col gap-2">
          <div class="py-2">
            <p class="text-sm italic">
              ETA: Early September
            </p>
          </div>
          <p>
            Currently, the processing time of the Seed Collector and Preserve Jar is not taken into account.
            This leads to highly inaccurate averages, as the planner assumes that the crop is processed
            immediately once harvested.
          </p>
          <p>
            Once the crop machines are implemented, they will be separated from the harvest approximations and
            will be calculated separately.
            This is because unlike the garden, the processing time of the machines is not affected by whether
            you're logged in or not,
            and will always take the same amount of time to process in real time.
          </p>
          <p>
            Part of this feature will also be setting how many of each machine you have, then show how long it
            will
            actually take
            to process them as a result.
            This should allow players with less machines to be able to properly evaluate how much gold they're
            getting on average.
          </p>
        </div>
      </div>

      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox">
        <div class="collapse-title text-xl">
          Plot Placement Rewrite
        </div>
        <div class="collapse-content flex flex-col gap-2">
          <div class="py-2">
            <p class="text-sm italic">
              ETA: Early September
            </p>
          </div>
          <p>
            The gardens currently support non-3x3 layouts, but each plot in the planner snaps perfectly to the
            other plots.
            This is in contrast to the game's behaviour, which allows for plots to be partially connected to
            each other.
            I first made the planner without realising this, and as a result the plot placement remains flawed.
          </p>
          <p>
            I've already developed plans for how this will be implemented.
            Considerations for how future saves will change without being extremely long are also already
            factored in.
            This plot placement re-write will improve a great deal of the planner internally,
            such as how crops are placed and bonuses calculated.
            This will also allow for better UI/UX improvements, such as crop placement previews and tile
            combining (for apple trees & blueberry bushes).
          </p>
        </div>
      </div>

      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox">
        <div class="collapse-title text-xl">
          Other Tools and Collaboration
        </div>
        <div class="collapse-content flex flex-col gap-2">
          <div class="py-2">
            <p class="text-sm italic">
              ETA: ???
            </p>
          </div>
          <p class="font-bold">
            Secret c:
          </p>
        </div>
      </div>
    </section>
    <section class="pb-2 max-w-3xl flex flex-col gap-4">
      <h2 class="text-2xl font-normal">
        Other Goals
      </h2>
      <p>
        These have no ETA and will be added when/if convenient.
        Some may also be scrapped if they're found not plausible or too difficult to implement.
      </p>

      <div class="collapse collapse-arrow bg-base-200 max-w-lg">
        <input type="checkbox">
        <div class="collapse-title text-lg">
          More Export Options
        </div>
        <div class="collapse-content flex flex-col gap-2 text-sm">
          <p>
            More export options will be added, particularly to text.
            Converting the garden to a markdown layout for example,
            as well as exporting to other garden planners (such as those in google sheets) for users who prefer
            them when/if possible.
          </p>
        </div>
      </div>

      <div class="collapse collapse-arrow bg-base-200 max-w-lg">
        <input type="checkbox">
        <div class="collapse-title text-lg">
          In-game Timer
        </div>
        <div class="collapse-content flex flex-col gap-2 text-sm">
          <p>
            In-game Palia timer with notifications for when crops are ready to be harvested.
          </p>
        </div>
      </div>

      <div class="collapse collapse-arrow bg-base-200 max-w-lg">
        <input type="checkbox">
        <div class="collapse-title text-lg">
          Link Shorteners
        </div>
        <div class="collapse-content flex flex-col gap-2 text-sm">
          <p>
            Whether done internally or via API, link shorteners will be added to the planner to help tackle the
            lengthy save codes.
          </p>
        </div>
      </div>

      <div class="collapse collapse-arrow bg-base-200 max-w-lg">
        <input type="checkbox">
        <div class="collapse-title text-lg">
          UI Rework
        </div>
        <div class="collapse-content flex flex-col gap-2 text-sm">
          <p>
            A UI rework of the website is planned,
            with the goal of keeping the current theme while making it on par with the quality of professional
            websites.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
