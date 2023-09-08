<script setup lang="ts">
const { width: screenWidth } = useWindowSize()

const isLg = computed(() => screenWidth.value >= 1024)
</script>

<template>
  <div>
    <header class="drawer drawer-end z-50">
      <input id="my-drawer-3" type="checkbox" class="drawer-toggle">
      <div class="drawer-content flex flex-col">
        <div class="w-full navbar py-4 md:px-12">
          <div class="flex-1 mx-2">
            <NuxtLink to="/" class="flex gap-2 items-center">
              <nuxt-img format="webp" src="/logo.webp" class="max-w-[3rem]" />
              <div class="flex flex-col gap-0 leading-tight">
                <h1 class="text-xl font-bold text-left lg:text-2xl leading-tight">
                  Palia Garden Planner
                </h1>
                <p class="text-xs text-left leading-tight">
                  <font-awesome-icon :icon="['fas', 'heart']" class="" />
                  A player-made tool for planning your garden
                </p>
              </div>
            </NuxtLink>
          </div>
          <div class="flex items-center">
            <div class="flex-none hidden lg:block">
              <ul class="menu menu-horizontal gap-2 items-center">
                <li class="text-lg">
                  <NuxtLink to="/roadmap">
                    Roadmap
                  </NuxtLink>
                </li>
                <li class="text-lg">
                  <NuxtLink to="/changelogs">
                    Changelogs
                  </NuxtLink>
                </li>
                <li class="dropdown dropdown-hover dropdown-bottom dropdown-end">
                  <label tabindex="0" class="text-lg">
                    <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xl" />
                    External Tools
                  </label>
                  <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li class="text-sm">
                      <NuxtLink to="https://palia.anniebananie.io" class="inline-block">
                        <font-awesome-icon :icon="['fas', 'gift']" class="text-xl" />
                        Gift Tracker
                        <span class="text-xs">(anniebananie)</span>
                      </NuxtLink>
                    </li>
                    <li class="text-sm">
                      <NuxtLink to="https://palia.th.gl/" class="inline-block">
                        <font-awesome-icon :icon="['fas', 'map']" class="text-xl" />
                        Interactive Map
                        <span class="text-xs">(The Hidden Gaming Lair)</span>
                      </NuxtLink>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
          <div class="flex-none lg:hidden">
            <label for="my-drawer-3" class="btn btn-square btn-ghost">
              <font-awesome-icon :icon="['fas', 'bars']" class="text-xl" />
            </label>
          </div>
        </div>
      </div>
      <div class="drawer-side">
        <label for="my-drawer-3" class="drawer-overlay" />
        <ul class="menu p-4 w-80 h-full bg-base-200 gap-2">
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
          <li>
            <div class="text-lg font-bold flex flex-col items-start">
              <p class="flex gap-2 items-center">
                <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xl" />
                External Tools
              </p>
              <ul>
                <li class="text-sm">
                  <NuxtLink to="https://palia.anniebananie.io" class="inline-block">
                    <font-awesome-icon :icon="['fas', 'gift']" class="text-xl" />
                    Gift Tracker
                    <span class="text-xs">(anniebananie)</span>
                  </NuxtLink>
                </li>
                <li class="text-sm">
                  <NuxtLink to="https://palia.th.gl/" class="inline-block">
                    <font-awesome-icon :icon="['fas', 'map']" class="text-xl" />
                    Interactive Map
                    <span class="text-xs">(The Hidden Gaming Lair)</span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </header>
    <div class="divider px-12 m-0" />
    <div class="px-2 md:px-8 lg:px-16 flex flex-col items-center" />
  </div>
</template>
