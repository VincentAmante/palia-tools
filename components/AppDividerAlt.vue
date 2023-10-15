<template>
  <div class="flex justify-between gap-0 items-center relative mx-2 ">
    <div class="absolute left-0">
      <nuxt-img
        class="w-3 h-3"
        format="webp"
        src="/ui/separator-alt-start.svg"
        alt="Separator Start"
        aria-hidden
      />
    </div>
    <div class="divider m-0 before:bg-accent after:bg-accent w-full px-[2px]" />
    <div class="absolute right-0">
      <nuxt-img
        class="w-3 h-3"
        format="webp"
        src="/ui/separator-alt-end.svg"
        alt="Separator End"
        aria-hidden
      />
    </div>
  </div>
</template>
