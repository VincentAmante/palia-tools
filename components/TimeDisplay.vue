<script setup lang="ts">
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useStorage } from '@vueuse/core'

dayjs.extend(utc)

const SECONDS_PER_HOUR = (60 / 24) * 60 // 60 real minutes per day = 150 seconds per in-game hour
const MS_PER_SECOND = 1000

const totalSeconds = ref((dayjs().utc().minute() * 60) + dayjs().utc().second())
const hour = ref(Math.floor(totalSeconds.value / SECONDS_PER_HOUR))

// A minute is set to be 1/60th of an in-game hour based on how many seconds until the next hour
const minute = ref(Math.floor((totalSeconds.value % SECONDS_PER_HOUR) / SECONDS_PER_HOUR * 60))

const hourFormatted = ref(hour.value > 12 ? hour.value - 12 : (hour.value === 0 ? 12 : hour.value))
const minuteFormatted = ref(minute.value < 10 ? `0${minute.value}` : minute.value)
const meridiem = ref(hour.value >= 12 ? 'PM' : 'AM')
const timeFormatted = ref(`${hourFormatted.value}:${minuteFormatted.value} ${meridiem.value}`)

setInterval(() => {
  totalSeconds.value = (dayjs().utc().minute() * 60) + dayjs().utc().second()
  hour.value = Math.floor(totalSeconds.value / SECONDS_PER_HOUR)
  minute.value = Math.floor(((totalSeconds.value % SECONDS_PER_HOUR) / SECONDS_PER_HOUR) * 60)

  hourFormatted.value = hour.value > 12 ? hour.value - 12 : (hour.value === 0 ? 12 : hour.value)
  minuteFormatted.value = minute.value < 10 ? `0${minute.value}` : minute.value
  meridiem.value = hour.value >= 12 ? 'PM' : 'AM'

  timeFormatted.value = `${hourFormatted.value}:${minuteFormatted.value} ${meridiem.value}`
}, MS_PER_SECOND)

const {
  show,
} = useWebNotification(
  {
    title: '6:00 AM in Palia',
    body: 'Time to Harvest!',
    icon: '/logo.webp',
  },
)

const dayAlert = useStorage('dayAlert', false)

watch(hour, () => {
  if (hour.value === 6 && dayAlert.value)
    show()
})
</script>

<template>
  <div class="grid md:col-span-2 gap-2 px-4">
    <div class="flex text-misc bg-accent rounded-md items-center justify-between px-4 py-2">
      <p class="">
        Game Time
      </p>
      <p class="font-bold text-2xl">
        {{ timeFormatted }}
      </p>
    </div>
    <div class="flex text-misc bg-accent rounded-md items-center justify-between px-4 py-2">
      <p>Remind Me</p>
      <input v-model="dayAlert" type="checkbox" class="toggle toggle-info">
    </div>
  </div>
</template>
