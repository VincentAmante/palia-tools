<template>
  <div>
    <header class="drawer drawer-end z-50">
      <input id="my-drawer-3" type="checkbox" class="drawer-toggle">
      <div class="drawer-content flex flex-col">
        <div class="w-full navbar py-4 md:px-12">
          <div class="flex-1 mx-2 ">
            <NuxtLink to="/" class="flex gap-2 items-center">
              <img src="/logo.webp" class="max-w-[3rem]">
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
          <div class="flex-none hidden lg:block">
            <ul class="menu menu-horizontal gap-2">
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
            </ul>
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
          <!-- <li>
            <div class="flex">
              <img src="/logo.webp" class="max-w-[3rem]">
              <p class="text-lg font-bold">
                Palia Garden Planner
              </p>
            </div>
            <div class="divider py-0 my-0" />
          </li> -->
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
        </ul>
      </div>
    </header>
    <div class="divider px-12 m-0" />
  </div>
</template>
