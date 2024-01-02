<template>
  <article class="w-full max-w-xs px-2 rounded-md card card-compact bg-palia-dark-blue">
    <div class="items-center text-center card-body">
      <p class="card-title">
        <slot name="name" />
      </p>
      <p>
        <slot name="for" />
      </p>
    </div>
  </article>
</template>
