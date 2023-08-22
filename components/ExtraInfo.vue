<template>
  <div class="flex flex-col gap-6 px-4 lg:px-16 max-w-7xl py-4 pb-12">
    <div class="flex flex-col gap-4 justify-between lg:flex-row items-start">
      <div class="collapse bg-base-200 w-fit collapse-arrow">
        <input type="checkbox">
        <h2 class="text-xl font-semibold collapse-title">
          Upcoming Features and Plans
        </h2>
        <div class="collapse-content flex flex-col gap-2 lg:gap-8 w-full max-w-lg">
          <div>
            <p class="text-lg font-bold max-w-md pb-2">
              High in priority list
            </p>
            <ul class="list-inside list-disc max-w-2xl lg:max-w-2xl">
              <li>Any bug fixes (highest priority)</li>
              <li>Patch Notes and feedback credits</li>
              <li>Starter presets for those new to gardening</li>
              <li>Better UI/UX (especially for mobile, but most screens are in sight)</li>
              <li>
                Conciseness of layout saves, for better sharing (old codes will still be supported when
                possible)
              </li>
            </ul>
          </div>
          <div>
            <h2 class="text-lg font-semibold">
              Other Planned Features
            </h2>
            <p class="max-w-md pb-2">
              These might take an unestimated amount of effort or non-prioritised, but
              are
              features I
              want
              to implement
            </p>

            <ul class="list-inside list-disc max-w-2xl lg:max-w-2xl">
              <li>Support for fertilisers (for price)</li>
              <li>More data displays</li>
              <li>Cosmetic naming of codes to distinguish them better</li>
              <li>
                Conversion of garden to markdown/known text format for displaying in either text,
                note-taking
                tools,
                or
                spreadsheets (if possible)
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-1 px-4 max-w-lg py-4 bg-base-300 rounded-lg">
        <h2 class="text-2xl font-bold">
          Credits
        </h2>
        <p class="text-sm max-w-sm">
          Thank you so much to these people for your information and assistance with the project!
        </p>
        <ul class="list-disc list-inside">
          <li>Arenvanya <span class="text-xs">(information)</span></li>
          <li>st3fannl <span class="text-xs">(assets)</span></li>
        </ul>
        <p class="text-sm">
          I also thank Singularity 6 for developing Palia, and everyone else for using the planner and providing feedback!
        </p>
      </div>
    </div>
  </div>
</template>
