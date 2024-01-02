<template>
  <article class="w-full max-w-lg px-2 border rounded-md card card-compact border-primary bg-palia-dark-blue">
    <div class="items-center text-center card-body">
      <p class="card-title ">
        <slot name="title" />
      </p>
      <div class="flex flex-col h-full gap-1 font-light">
        <slot name="description" />
      </div>
    </div>
  </article>
</template>
