<template>
  <footer class=" flex gap-2 items-center justify-between lg:px-16 text-center sm:text-left w-full text-xs font-normal p-4">
    <div class="bg-palia-dark-blue p-2">
      <p class="max-w-md">
        &copy; Palia's intellectual property and assets is reserved by Singularity 6. This tool is fan-made and not affliated in any way with Palia or
        Singularity 6.
      </p>
    </div>
    <div>
      <NuxtLink
        to="https://github.com/VincentAmante/palia-tools"
        target="_blank"
        class="btn btn-sm btn-primary w-fit"
      >
        <font-awesome-icon :icon="['fab', 'github']" class="" />
        Github Source Code
      </NuxtLink>
    </div>
  </footer>
</template>
