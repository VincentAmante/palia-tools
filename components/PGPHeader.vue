<template>
  <div>
    <header class="drawer drawer-end z-50">
      <input id="my-drawer-3" type="checkbox" class="drawer-toggle">
      <div class="drawer-content flex flex-col">
        <!-- Navbar -->
        <div class="w-full navbar py-4">
          <div class="flex-1 mx-2">
            <a href="/" class="flex gap-2 items-center">
              <img src="/logo.webp" class="max-w-[3rem]">
              <div class="flex flex-col gap-0 leading-tight">
                <h1 class="text-xl font-bold text-left lg:text-2xl leading-tight">
                  Palia Garden Planner
                </h1>
                <p class=" text-xs text-left leading-tight">
                  <font-awesome-icon :icon="['fas', 'heart']" class="" />
                  A player-made tool for planning your garden
                </p>
              </div>
            </a>
          </div>
          <div class="flex-none hidden lg:block">
            <ul class="menu menu-horizontal">
              <li><a>Roadmap</a></li>
              <li><a>Changelogs</a></li>
            </ul>
          </div>
          <div class="flex-none lg:hidden">
            <label for="my-drawer-3" class="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                class="inline-block w-6 h-6 stroke-current"
              >
                <path
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
        </div>
      </div>
      <div class="drawer-side">
        <label for="my-drawer-3" class="drawer-overlay" />
        <ul class="menu p-4 w-80 h-full bg-base-200">
          <li><a>Roadmap</a></li>
          <li><a>Changelogs</a></li>
        </ul>
      </div>
    </header>
    <div class="divider px-12 m-0" />
  </div>
</template>
