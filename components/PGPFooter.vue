<template>
  <footer v-once class="px-4 mt-2 lg:px-12">
    <div class="flex flex-col items-start justify-between w-full gap-2 p-4 mb-4 font-normal text-center bg-opacity-50 rounded-lg lg:flex-row sm:text-left bg-palia-blue">
      <div class="grid text-sm">
        <p class="max-w-md">
          &copy; Palia's intellectual property and assets are reserved by Singularity 6.
        </p>
        <p>
          This tool is fan-made and not affliated in any way with Singularity 6 or Palia.
        </p>
      </div>
      <div class="flex flex-col items-center w-full gap-1 lg:w-fit lg:items-end">
        <div class="flex items-center gap-1">
          Developed by
          <NuxtLink
            to="https://discord.com/users/204462556012740608"
            target="_blank"
            class="normal-case btn btn-ghost btn-sm"
          >
            <font-awesome-icon :icon="['fab', 'discord']" class="" />
            .aisen
          </NuxtLink>
        </div>
        <NuxtLink
          to="https://github.com/VincentAmante/palia-tools"
          target="_blank"
          class="w-full btn"
        >
          <font-awesome-icon :icon="['fab', 'github']" class="text-lg" />
          Source Code
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
