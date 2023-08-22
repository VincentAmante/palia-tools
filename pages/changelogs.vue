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
          Garden Planner Changelogs
        </h1>
      </div>
      <div class="collapse collapse-arrow bg-base-200 max-w-2xl">
        <input type="checkbox" checked>
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
