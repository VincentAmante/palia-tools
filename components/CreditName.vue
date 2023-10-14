<template>
  <article class="card card-compact bg-palia-dark-blue rounded-md px-2 w-full max-w-xs">
    <div class="card-body text-center items-center">
      <p class="card-title">
        <slot name="name" />
      </p>
      <p>
        <slot name="for" />
      </p>
    </div>
  </article>
</template>
