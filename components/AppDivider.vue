<template>
  <div class="flex justify-between gap-0 items-center relative ">
    <div class="absolute left-0">
      <img
        class="w-auto h-3"
        format="webp"
        src="/ui/separator-start.svg"
        alt="Separator Start"
        aria-hidden
        :srcset="undefined"
      >
    </div>
    <div class="divider m-0 before:bg-misc after:bg-misc before:h-[1px] after:h-[1px] w-full px-[2px]" />
    <div class="absolute right-0">
      <img
        class="w-auto h-3"
        format="webp"
        src="/ui/separator-end.svg"
        alt="Separator End"
        aria-hidden
        :srcset="undefined"
      >
    </div>
  </div>
</template>
