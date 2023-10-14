<template>
  <article class="card card-compact border border-primary rounded-md px-2 w-full max-w-lg bg-palia-dark-blue">
    <div class="card-body text-center items-center">
      <p class="card-title ">
        <slot name="title" />
      </p>
      <div class="h-full font-light">
        <slot name="description" />
      </div>
    </div>
  </article>
</template>
