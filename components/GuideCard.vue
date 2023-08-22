<template>
  <div class="px-4 md:px-16 flex flex-col gap-2 lg:flex-row md:gap-8">
    <div class="bg-base-300 rounded-lg p-4 h-fit w-fit flex flex-col gap-2">
      <h3 class="font-semibold">
        <font-awesome-icon :icon="['fas', 'question-circle']" class="" />
        New to Gardening?
      </h3>
      <p class="text-sm max-w-sm">
        Feel free to check out Shepp Arenvanya's guide to gardening in Palia!
      </p>
      <a
        href="https://docs.google.com/document/d/1bjqQGwzhW7wsIpSDoO3xCMwqbX7ZbsdsuuXmPEXCrjE/" target="_blank"
        class="btn btn-primary w-fit btn-sm"
      >
        <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="mr-2" />
        <p>Go to Guide</p>
      </a>
    </div>
  </div>
</template>
