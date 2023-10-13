<template>
  <footer v-once class="px-4 lg:px-14">
    <div class="flex flex-col lg:flex-row gap-2 items-start justify-between text-center sm:text-left w-full font-normal p-4 rounded-lg bg-palia-blue mb-4 bg-opacity-50">
      <div class="grid text-sm">
        <p class="max-w-md">
          &copy; Palia's intellectual property and assets are reserved by Singularity 6.
        </p>
        <p>
          This tool is fan-made and not affliated in any way with Singularity 6 or Palia.
        </p>
      </div>
      <div class="flex flex-col w-full items-center lg:w-fit lg:items-end gap-1">
        <div class="flex items-center gap-1">
          Developed by
          <NuxtLink
            to="https://discord.com/users/204462556012740608"
            target="_blank"
            class="btn btn-ghost normal-case btn-sm"
          >
            <font-awesome-icon :icon="['fab', 'discord']" class="" />
            .aisen
          </NuxtLink>
        </div>
        <NuxtLink
          to="https://github.com/VincentAmante/palia-tools"
          target="_blank"
          class="btn w-full"
        >
          <font-awesome-icon :icon="['fab', 'github']" class="text-lg" />
          Source Code
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
