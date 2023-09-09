<template>
  <footer class="flex flex-col gap-2 text-center sm:text-left w-full text-xs font-normal text-gray-600 p-4 pb-8 md:px-8 lg:px-16">
    <p class="max-w-md">
      &copy; Palia's intellectual property and assets is reserved by Singularity 6. This tool is fan-made and not affliated in any way with Palia or
      Singularity 6.
    </p>
    <p>You may contact me as .aisen on Discord!</p>

    <NuxtLink
      to="https://github.com/VincentAmante/palia-tools"
      target="_blank"
      class="btn btn-sm btn-primary w-fit"
    >
      <font-awesome-icon :icon="['fab', 'github']" class="" />
      Github Source Code
    </NuxtLink>
  </footer>
</template>
