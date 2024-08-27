<template>
  <div class="grid md:grid-cols-3 items-center gap-2 px-2 text-center lg:px-12 max-w-[1680px]">
    <NuxtLink
      to="https://docs.google.com/document/d/1bjqQGwzhW7wsIpSDoO3xCMwqbX7ZbsdsuuXmPEXCrjE/" target="_blank"
      class="flex items-center justify-center w-full gap-1 p-4 normal-case rounded-lg bg-opacity-70 bg-op md:col-span-2 md:p-2 h-fit btn bg-palia-blue-dark hover:border-none hover:bg-primary hover:text-palia-blue-dark"
    >
      <!-- <font-awesome-icon :icon="['fas', 'book-open']" class="mr-1 text-lg" /> -->

      <font-awesome-icon :icon="['fas', 'book-open']" class="mr-1 text-lg" />
      <p class="items-center gap-2 text-sm font-semibold break-words md:text-base md:flex">
        Shepp Arenvanya's Guide to Gardening
        <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="mr-1 text-xs opacity-50" />
      </p>
    </NuxtLink>
    <NuxtLink
      to="https://ko-fi.com/aisencrown" target="_blank"
      class="flex items-center justify-center w-full gap-1 p-4 normal-case rounded-lg bg-opacity-70 md:p-2 h-fit btn bg-palia-blue-dark hover:text-palia-blue-dark hover:border-none hover:bg-primary"
    >
      <img src="/externals/kofi.webp" alt="Ko-fi Logo" width="28" class="mr-1" />
      <p class="flex items-center gap-2 text-sm font-semibold md:text-base">
        Buy me a coffee?
        <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="mr-1 text-xs opacity-50" />
      </p>
    </NuxtLink>
  </div>
</template>
