<script setup lang="ts">
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const SECONDS_PER_HOUR = (60 / 24) * 60 // 60 real minutes per day = 150 seconds per in-game hour
const MS_PER_SECOND = 1000

const hour = ref(Math.floor((dayjs().utc().minute() * 24) / 60))
const totalSeconds = ref((dayjs().utc().minute() * 60) + dayjs().utc().second())

// A minute is set to be 1/60th of an in-game hour based on how many seconds until the next hour
const minute = ref(Math.floor((totalSeconds.value % SECONDS_PER_HOUR) / SECONDS_PER_HOUR * 60))

const hourFormatted = ref(hour.value > 12 ? hour.value - 12 : (hour.value === 0 ? 12 : hour.value))
const minuteFormatted = ref(minute.value < 10 ? `0${minute.value}` : minute.value)
const meridiem = ref(hour.value >= 12 ? 'PM' : 'AM')
const timeFormatted = ref(`${hourFormatted.value}:${minuteFormatted.value} ${meridiem.value}`)

setInterval(() => {
  hour.value = Math.floor((dayjs().utc().minute() * 24) / 60)
  totalSeconds.value = (dayjs().utc().minute() * 60) + dayjs().utc().second()
  minute.value = Math.floor(((totalSeconds.value % SECONDS_PER_HOUR) / SECONDS_PER_HOUR) * 60)

  hourFormatted.value = hour.value > 12 ? hour.value - 12 : (hour.value === 0 ? 12 : hour.value)
  minuteFormatted.value = minute.value < 10 ? `0${minute.value}` : minute.value
  meridiem.value = hour.value >= 12 ? 'PM' : 'AM'

  timeFormatted.value = `${hourFormatted.value}:${minuteFormatted.value} ${meridiem.value}`
}, MS_PER_SECOND)
</script>

<template>
  <div class="text-xl font-light bg-accent p-2 px-6 text-white rounded-md w-fit flex flex-col items-center text-center leading-none gap-0">
    <p>{{ timeFormatted }}</p>
    <p class="text-xs opacity-80">
      Palia Time
    </p>
  </div>
</template>
