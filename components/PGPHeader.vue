<template>
  <div>
    <header class="drawer drawer-end z-50">
      <input id="menu" type="checkbox" class="drawer-toggle">
      <div class="drawer-content flex flex-col">
        <div class="w-full navbar py-3 sm:px-12 lg:px-22">
          <div class="flex-1 mx-2">
            <NuxtLink to="/" class="flex gap-2 items-center">
              <nuxt-img
                format="webp" src="/logo.webp"
                width="48px" height="48px" alt="Palia Garden Planner Logo"
                class="max-w-[3rem]"
              />
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
              <ul class="menu menu-horizontal gap-1 items-center text-base">
                <li>
                  <NuxtLink to="/roadmap">
                    Roadmap
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/changelogs">
                    Changelogs
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink>
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" class="max-w-[1.25rem] inline-block" viewBox="0 0 428 384">
                          <path fill="#EEE3D1" d="m408.99 56.65-115.32 8.98c-1.38.1-2.63-.85-2.99-2.28C281.73 27.2 250.92.56 214.29.56S146.85 27.2 137.9 63.35c-.36 1.43-1.61 2.39-2.99 2.28L19.58 56.65C6.2 55.6-3.15 70.53 2.85 83.36l7.57 16.19c.83 1.77 2.52 2.89 4.37 2.89h63.76l-1.61 36.36H45.79c-10.93 0-17.5 11.56-11.52 20.29l8.5 12.41c1.77 2.59 4.8 4.15 8.05 4.15H75.3l-1.45 32.58-.25 5.69-7.18 161.4c-.19 4.25 3.21 7.8 7.46 7.8h46.95c4.26 0 7.65-3.55 7.47-7.8l-7.18-161.4-.25-5.69-1.45-32.58h191.66l-1.45 32.58-.25 5.69-7.18 161.4c-.19 4.25 3.2 7.8 7.46 7.8h46.95c4.25 0 7.65-3.55 7.46-7.8l-7.18-161.4-.25-5.69-1.45-32.58h22.55c3.25 0 6.28-1.56 8.06-4.15l8.5-12.41c5.97-8.73-.59-20.29-11.52-20.29h-29.23l-1.61-36.36h61.84c1.85 0 3.54-1.12 4.36-2.88l7.58-16.2c6-12.83-3.35-27.76-16.73-26.71Zm-96.27 82.15H117.78l-1.61-36.36h20.78l27.94.01c1.9 0 3.28-1.93 2.78-3.89a55.188 55.188 0 0 1-1.68-13.54c0-28.44 21.53-51.52 48.12-51.62 26.67-.1 48.25 22.67 48.48 51.17.04 4.85-.55 9.54-1.68 14-.5 1.96.9 3.88 2.8 3.88h27.92l22.7-.01-1.61 36.36Z" />
                        </svg>
                        Paliapedia
                      </NuxtLink>
                    </li>
                  </ul>
                </li>
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" class="max-w-[1.25rem] inline-block" viewBox="0 0 428 384">
                      <path fill="#2e282a" d="m408.99 56.65-115.32 8.98c-1.38.1-2.63-.85-2.99-2.28C281.73 27.2 250.92.56 214.29.56S146.85 27.2 137.9 63.35c-.36 1.43-1.61 2.39-2.99 2.28L19.58 56.65C6.2 55.6-3.15 70.53 2.85 83.36l7.57 16.19c.83 1.77 2.52 2.89 4.37 2.89h63.76l-1.61 36.36H45.79c-10.93 0-17.5 11.56-11.52 20.29l8.5 12.41c1.77 2.59 4.8 4.15 8.05 4.15H75.3l-1.45 32.58-.25 5.69-7.18 161.4c-.19 4.25 3.21 7.8 7.46 7.8h46.95c4.26 0 7.65-3.55 7.47-7.8l-7.18-161.4-.25-5.69-1.45-32.58h191.66l-1.45 32.58-.25 5.69-7.18 161.4c-.19 4.25 3.2 7.8 7.46 7.8h46.95c4.25 0 7.65-3.55 7.46-7.8l-7.18-161.4-.25-5.69-1.45-32.58h22.55c3.25 0 6.28-1.56 8.06-4.15l8.5-12.41c5.97-8.73-.59-20.29-11.52-20.29h-29.23l-1.61-36.36h61.84c1.85 0 3.54-1.12 4.36-2.88l7.58-16.2c6-12.83-3.35-27.76-16.73-26.71Zm-96.27 82.15H117.78l-1.61-36.36h20.78l27.94.01c1.9 0 3.28-1.93 2.78-3.89a55.188 55.188 0 0 1-1.68-13.54c0-28.44 21.53-51.52 48.12-51.62 26.67-.1 48.25 22.67 48.48 51.17.04 4.85-.55 9.54-1.68 14-.5 1.96.9 3.88 2.8 3.88h27.92l22.7-.01-1.61 36.36Z" />
                    </svg>
                    Paliapedia
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </header>
    <AppDivider class="mx-2 sm:mx-12 lg:mx-22" />
  </div>
</template>
