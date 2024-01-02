<template>
  <div class="flex flex-col items-center gap-2 px-2 text-center lg:px-12">
    <div class="bg-misc-secondary rounded-lg max-w-[1680px] p-4 md:p-2 h-fit flex flex-col md:flex-row items-center justify-center gap-2 w-full">
      <p class="font-semibold">
        <font-awesome-icon :icon="['fas', 'question-circle']" class="text-sm" />
        New to Gardening?
      </p>
      <p class="text-sm font-light">
        Check out Shepp Arenvanya's guide to gardening in Palia!
      </p>
      <NuxtLink
        to="https://docs.google.com/document/d/1bjqQGwzhW7wsIpSDoO3xCMwqbX7ZbsdsuuXmPEXCrjE/" target="_blank"
        class="px-6 text-sm font-normal rounded-full btn btn-misc w-fit btn-sm"
      >
        <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="mr-1" />
        <p>Go to Guide</p>
      </NuxtLink>
    </div>
  </div>
</template>
