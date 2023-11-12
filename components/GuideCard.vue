<template>
  <div class="px-2 lg:px-12 lg:mx-2  flex flex-col gap-2 items-center text-center">
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
        class="btn btn-misc w-fit btn-sm text-sm px-6 font-normal rounded-full"
      >
        <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="mr-1" />
        <p>Go to Guide</p>
      </NuxtLink>
    </div>
  </div>
</template>
