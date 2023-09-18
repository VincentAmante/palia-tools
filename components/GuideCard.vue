<template>
  <div class="px-4 md:px-16 flex flex-col gap-2 items-center">
    <div class="bg-misc-secondary rounded-lg p-4 max-w-[1680px]  md:p-2 h-fit flex flex-col md:flex-row items-center justify-center gap-2 w-full">
      <h3 class="font-semibold">
        <font-awesome-icon :icon="['fas', 'question-circle']" class="text-sm" />
        New to Gardening?
      </h3>
      <p class="text-sm font-light">
        Check out Shepp Arenvanya's guide to gardening in Palia!
      </p>
      <NuxtLink
        to="https://docs.google.com/document/d/1bjqQGwzhW7wsIpSDoO3xCMwqbX7ZbsdsuuXmPEXCrjE/" target="_blank"
        class="btn btn-misc w-fit btn-sm text-sm px-6 font-normal rounded-full"
      >
        <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="mr-1" />
        <p>Go to Guide</p>
      </NuxtLink>
    </div>
    <!-- <div>
      <div class="collapse collapse-arrow border border-base-200 bg-base-200 w-fit">
        <input type="checkbox">
        <h2 class=" collapse-title text-lg font-bold">
          <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-2" />
          How to Use
        </h2>
        <div class="collapse-content">
          <ol class="list-inside list-decimal max-w-md text-sm text-left gap-2 flex flex-col">
            <li>
              Click on any of the crops below to select it
            </li>
            <li>
              Below the buttons is a 3x3 grid garden, with a button to create layouts of different
              sizes/configurations
            </li>
            <li>
              With a crop selected, click on any tile in the garden to place the crop on that tile
            </li>
            <li>
              Right click on a tile to remove the crop from that tile
            </li>
            <li class="hidden lg:list-item">
              <span class="font-bold">Desktop: </span>You can hold your key to place multiple crops at once,
              or
              hold
              right click to remove multiple crops at once
            </li>
            <li>
              When finished, you may save your layout as a code or link below the garden
            </li>
            <li>
              You may load a layout from a code by pasting it in the box below the garden
            </li>
            <li>You may also export the layout as an image for easy sharing, works well for mobile too!</li>
            <li class="lg:hidden">
              If on mobile, you may check which bonuses are represented by which icon by the visualiser
              below the garden
            </li>
          </ol>
        </div>
      </div>
    </div> -->
  </div>
</template>
