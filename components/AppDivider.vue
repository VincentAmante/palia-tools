<template>
  <div class="flex justify-between gap-0 items-center relative mx-2 sm:mx-12 lg:mx-22">
    <div class="absolute left-0">
      <nuxt-img
        class="w-3 h-3"
        format="webp"
        src="/ui/separator-start.svg"
        alt="Separator Start"
        aria-hidden
      />
    </div>
    <div class="divider m-0 before:bg-misc after:bg-misc w-full px-[2px]" />
    <div class="absolute right-0">
      <nuxt-img
        class="w-3 h-3"
        format="webp"
        src="/ui/separator-end.svg"
        alt="Separator End"
        aria-hidden
      />
    </div>
  </div>
</template>
