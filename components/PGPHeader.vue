<template>
  <div>
    <header class="z-50 drawer drawer-end">
      <input id="menu" type="checkbox" class="drawer-toggle" aria-label="toggle menu" />
      <div class="flex flex-col drawer-content">
        <div class="w-full py-3 navbar sm:px-12">
          <div class="flex-1">
            <NuxtLink to="/" class="flex items-center gap-2">
              <img format="webp" src="/logo.webp" width="48px" height="48px" alt="Palia Garden Planner Logo"
                class="max-w-[3rem]">
              <div class="flex flex-col gap-0 leading-tight">
                <h1 class="text-xl font-bold leading-tight text-left lg:text-2xl">
                  Palia Garden Planner
                </h1>
                <p class="text-xs leading-tight text-left">
                  <font-awesome-icon :icon="['fas', 'heart']" class="" />
                  A player-made tool for planning your garden
                </p>
              </div>
            </NuxtLink>
          </div>
          <div class="flex items-center">
            <div class="flex-none hidden lg:block">
              <ul class="items-center gap-1 text-base menu menu-horizontal">
                <li>
                  <NuxtLink to="/roadmap" :prefetch=false>
                    Roadmap
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/changelogs" :prefetch=false>
                    Changelogs
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/credits" :prefetch=false>
                    Credits
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink class="" target="_blank" :prefetch="false" rel="noopener"
                    to="https://paliapedia.com/tools/garden">
                    <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-harvest-boost" :aria-hidden="true" />
                    Layout Generator
                  </NuxtLink>
                </li>
                <li class="dropdown dropdown-hover dropdown-bottom dropdown-end">
                  <label tabindex="0">
                    <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xl" />
                    External Tools
                  </label>
                  <ul tabindex="0" class="dropdown-content z-1 menu p-2 shadow-sm bg-base-100 rounded-box w-52">
                    <li class="text-sm">
                      <NuxtLink to="https://palia.anniebananie.io" class="flex flex-wrap items-center" rel="noopener"
                        target="_blank" :prefetch="false">
                        <font-awesome-icon :icon="['fas', 'gift']" class="text-xl" />
                        Palia Tracker
                        <span class="text-xs">(anniebananie)</span>
                      </NuxtLink>
                    </li>
                    <li class="text-sm">
                      <NuxtLink to="https://palia.th.gl/" class="flex flex-wrap items-center" rel="noopener"
                        target="_blank" :prefetch="false">
                        <font-awesome-icon :icon="['fas', 'map']" class="text-xl" />
                        Interactive Map
                        <span class="text-xs">(The Hidden Gaming Lair)</span>
                      </NuxtLink>
                    </li>
                    <li class="text-sm">
                      <NuxtLink to="https://paliapedia.com/" class="flex" rel="noopener" target="_blank"
                        :prefetch="false">
                        <img src="https://paliapedia.com/favicon.ico" width="18px" height="18px"
                          class="max-w-[1.5rem] inline-block text-lg" alt="Paliapedia Logo">
                        Paliapedia
                      </NuxtLink>
                    </li>
                    <li class="text-sm">
                      <NuxtLink to="https://paliaparty.app/" class="flex" rel="noopener" target="_blank"
                        :prefetch="false">
                        <img src="https://paliaparty.app/favicon.ico" width="18px" height="18px"
                          class="max-w-[1.5rem] inline-block text-lg" alt="Palia Party Logo">
                        Palia Party
                      </NuxtLink>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
          <div class="flex-none lg:hidden">
            <label for="menu" class="btn btn-square btn-ghost" aria-label="menu toggle">
              <font-awesome-icon :icon="['fas', 'bars']" class="text-xl" />
            </label>
          </div>
        </div>
      </div>
      <div class="overflow-x-hidden drawer-side">
        <label for="menu" class="drawer-overlay" aria-label="close menu" />
        <ul class="relative h-full gap-2 p-4 menu w-80 bg-base-200">
          <li class="flex items-end w-full lg:hidden">
            <label for="menu-side">
              <font-awesome-icon :icon="['fas', 'x']" class="text-xl" />
              <input id="menu-side" type="checkbox" class="drawer-toggle" aria-label="close menu">
            </label>
          </li>
          <li class="text-lg font-bold normal-case">
            <NuxtLink to="/roadmap">
              Roadmap
            </NuxtLink>
          </li>
          <li class="text-lg font-bold normal-case">
            <NuxtLink to="/changelogs">
              Changelogs
            </NuxtLink>
          </li>
          <li class="text-lg font-bold normal-case">
            <NuxtLink to="/credits">
              Credits
            </NuxtLink>
          </li>
          <li class="text-lg font-bold normal-case">
            <NuxtLink class="" target="_blank" rel="noopener" :prefetch="false"
              to="https://paliapedia.com/tools/garden">
              <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-harvest-boost" :aria-hidden="true" />
              Layout Generator
            </NuxtLink>
          </li>
          <li>
            <div class="flex flex-col items-start text-lg font-bold">
              <p class="flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xl" />
                External Tools
              </p>
              <ul>
                <li class="text-sm">
                  <NuxtLink to="https://palia.anniebananie.io" class="flex flex-wrap items-center" rel="noopener"
                    target="_blank" :prefetch="false">
                    <font-awesome-icon :icon="['fas', 'gift']" class="text-xl" />
                    Palia Tracker
                  </NuxtLink>
                </li>
                <li class="text-sm">
                  <NuxtLink to="https://palia.th.gl/" class="flex flex-wrap items-center" rel="noopener" target="_blank"
                    :prefetch="false">
                    <font-awesome-icon :icon="['fas', 'map']" class="text-xl" />
                    Interactive Map
                    <span class="text-xs">(The Hidden Gaming Lair)</span>
                  </NuxtLink>
                </li>
                <li class="text-sm">
                  <NuxtLink to="https://paliapedia.com/" class="flex" rel="noopener" target="_blank" :prefetch="false">
                    <img src="https://paliapedia.com/favicon.ico" width="18px" height="18px"
                      class="max-w-[1.5rem] inline-block text-lg" alt="Paliapedia Logo">
                    Paliapedia
                  </NuxtLink>
                </li>
                <li class="text-sm">
                  <NuxtLink to="https://paliaparty.app/" class="flex" rel="noopener" target="_blank" :prefetch="false">
                    <img src="https://paliaparty.app/favicon.ico" width="18px" height="18px"
                      class="max-w-[1.5rem] inline-block text-lg" alt="Palia Party Logo">
                    Palia Party
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </header>
    <AppDivider class="mx-2 sm:mx-12" />
  </div>
</template>
