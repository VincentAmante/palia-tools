<template>
  <div>
    <header class="drawer drawer-end z-50">
      <input id="menu" type="checkbox" class="drawer-toggle">
      <div class="drawer-content flex flex-col">
        <div class="w-full navbar py-3 sm:px-12 lg:px-22">
          <div class="flex-1 mx-2">
            <NuxtLink to="/" class="flex gap-2 items-center">
              <nuxt-img
                format="webp" src="/housing-logo.webp"
                width="48px" height="48px" alt="Palia Garden Planner Logo"
                class="max-w-[3rem]"
              />
              <div class="flex flex-col gap-0 leading-tight">
                <h1 class="text-xl font-bold text-left lg:text-2xl leading-tight">
                  Palia Housing Planner
                </h1>
                <p class="text-xs text-left leading-tight">
                  <font-awesome-icon :icon="['fas', 'heart']" class="" />
                  A player-made tool for planning your house
                </p>
              </div>
            </NuxtLink>
          </div>
          <div class="flex items-center">
            <div class="flex-none hidden lg:block">
              <ul class="menu menu-horizontal gap-1 items-center text-base">
                <li>
                  <NuxtLink to="/">
                    Garden Planner
                  </NuxtLink>
                </li>
                <!-- <li>
                  <NuxtLink to="/roadmap">
                    Roadmap
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/changelogs">
                    Changelogs
                  </NuxtLink>
                </li> -->
                <!-- <li>
                  <NuxtLink to="/credits">
                    Credits
                  </NuxtLink>
                </li>
                <li class="dropdown dropdown-hover dropdown-bottom dropdown-end">
                  <label tabindex="0">
                    <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xl" />
                    External Tools
                  </label>
                  <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li class="text-sm">
                      <NuxtLink to="https://palia.anniebananie.io" class="flex items-center flex-wrap" rel="noopener">
                        <font-awesome-icon :icon="['fas', 'gift']" class="text-xl" />
                        Gift Tracker
                        <span class="text-xs">(anniebananie)</span>
                      </NuxtLink>
                    </li>
                    <li class="text-sm">
                      <NuxtLink to="https://palia.th.gl/" class="flex items-center flex-wrap" rel="noopener">
                        <font-awesome-icon :icon="['fas', 'map']" class="text-xl" />
                        Interactive Map
                        <span class="text-xs">(The Hidden Gaming Lair)</span>
                      </NuxtLink>
                    </li>
                    <li class="text-sm">
                      <NuxtLink to="https://paliapedia.com/" class="flex" rel="noopener">
                        <nuxt-img
                          src="/externals/paliapedia.svg" width="18px" height="18px"
                          class="max-w-[1.5rem] inline-block text-lg"
                          alt="Paliapedia Logo"
                        />
                        Paliapedia
                      </NuxtLink>
                    </li>
                  </ul>
                </li> -->
              </ul>
            </div>
          </div>
          <div class="flex-none lg:hidden">
            <label
              for="menu" class="btn btn-square btn-ghost"
              aria-label="menu toggle"
            >
              <font-awesome-icon :icon="['fas', 'bars']" class="text-xl" />
            </label>
          </div>
        </div>
      </div>
      <div class="drawer-side">
        <label
          for="menu" class="drawer-overlay"
          aria-label="close menu"
        />
        <ul class="menu p-4 w-80 h-full bg-base-200 gap-2 relative">
          <li class="w-full flex items-end lg:hidden">
            <label for="menu">
              <font-awesome-icon :icon="['fas', 'x']" class="text-xl" />
              <input id="menu" type="checkbox" class="drawer-toggle">
            </label>
          </li>
          <li>
            <NuxtLink to="/">
              Garden Planner
            </NuxtLink>
          </li>
          <!-- <li class="text-lg font-bold normal-case">
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
          <li>
            <div class="text-lg font-bold flex flex-col items-start">
              <p class="flex gap-2 items-center">
                <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xl" />
                External Tools
              </p>
              <ul>
                <li class="text-sm">
                  <NuxtLink to="https://palia.anniebananie.io" class="flex items-center flex-wrap" rel="noopener">
                    <font-awesome-icon :icon="['fas', 'gift']" class="text-xl" />
                    Gift Tracker
                    <span class="text-xs">(anniebananie)</span>
                  </NuxtLink>
                </li>
                <li class="text-sm">
                  <NuxtLink to="https://palia.th.gl/" class="flex items-center flex-wrap" rel="noopener">
                    <font-awesome-icon :icon="['fas', 'map']" class="text-xl" />
                    Interactive Map
                    <span class="text-xs">(The Hidden Gaming Lair)</span>
                  </NuxtLink>
                </li>
                <li class="text-sm">
                  <NuxtLink to="https://paliapedia.com/" class="flex" rel="noopener">
                    <nuxt-img
                      src="/externals/paliapedia.svg" width="18px" height="18px"
                      class="max-w-[1.5rem] inline-block text-lg"
                      alt="Paliapedia Logo"
                    />
                    Paliapedia
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </li> -->
        </ul>
      </div>
    </header>
    <AppDivider class="mx-2 sm:mx-12 lg:mx-22" />
  </div>
</template>
