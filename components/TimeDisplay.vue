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

const {
  show,
} = useWebNotification(
  {
    title: '6:00 AM in Palia',
    body: 'Time to Harvest!',
    icon: '/logo.png',
  },
)

watch(hour, () => {
  if (hour.value === 6)
    show()
})
</script>

<template>
  <div class="px-6 w-full flex justify-center items-center text-neutral leading-none gap-2 sm:justify-start sm:px-12 md:px-20">
    <div class="flex flex-row-reverse gap-2">
      <p>{{ timeFormatted }}</p>
      <p class="text-xs opacity-80">
        Game Time
      </p>
    </div>
  </div>
</template>
