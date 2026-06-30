<script setup lang="ts">
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const SECONDS_PER_HOUR = (60 / 24) * 60 // 60 real minutes per day = 150 seconds per in-game hour
const MS_PER_SECOND = 1000

const totalSeconds = ref((dayjs().utc().minute() * 60) + dayjs().utc().second())
const hour = ref(Math.floor(totalSeconds.value / SECONDS_PER_HOUR))

// A minute is set to be 1/60th of an in-game hour based on how many seconds until the next hour
const minute = ref(Math.floor((totalSeconds.value % SECONDS_PER_HOUR) / SECONDS_PER_HOUR * 60))

const hourFormatted = ref(hour.value > 12 ? hour.value - 12 : (hour.value === 0 ? 12 : hour.value))
const minuteFormatted = ref(minute.value)
const meridiem = ref(hour.value >= 12 ? 'PM' : 'AM')
const timeFormatted = ref(`${hourFormatted.value}:${minuteFormatted.value} ${meridiem.value}`)

const INTERVAL_MS = 1000

onMounted(() => {
  setInterval(() => {
    totalSeconds.value = (dayjs().utc().minute() * 60) + dayjs().utc().second()
    hour.value = Math.floor(totalSeconds.value / SECONDS_PER_HOUR)
    minute.value = Math.floor(((totalSeconds.value % SECONDS_PER_HOUR) / SECONDS_PER_HOUR) * 60)

    hourFormatted.value = hour.value > 12 ? hour.value - 12 : (hour.value === 0 ? 12 : hour.value)
    minuteFormatted.value = minute.value
    meridiem.value = hour.value >= 12 ? 'PM' : 'AM'

    timeFormatted.value = `${hourFormatted.value}:${minuteFormatted.value} ${meridiem.value}`
  }, INTERVAL_MS)
})

// const {
//   show,
//   permissionGranted,
//   ensurePermissions,
// } = useWebNotification(
//   {
//     title: '6:00 AM in Palia',
//     body: 'Check your garden!',
//     icon: '/logo.webp',
//     requestPermissions: false,
//   },
// )

// const dayAlert = useStorage('dayAlert', false)

// watch(dayAlert, () => {
//   if (dayAlert.value && !permissionGranted.value)
//     ensurePermissions()
// })

// watch(hour, () => {
//   if (hour.value === 6 && dayAlert.value)
//     show()
// })
</script>

<template>
  <ClientOnly>

    <div class="gap-2 px-4">
      <div class="flex flex-col items-center justify-center w-full px-3 py-2 rounded-md text-accent md:py-0">
        <p
class="text-3xl"
          :class="{ 'text-harvest-boost': (hourFormatted === 6 && minuteFormatted === '00' && meridiem === 'AM') }">
          <span class="countdown tracking-widest">
            <span
class="" :style="`--value:${hourFormatted}; --digits:2`" aria-live="polite"
              :aria-label="`${hourFormatted}`">{{
                hourFormatted }}</span>:
            <span :style="`--value:${minuteFormatted}; --digits:2`" aria-live="polite" :aria-label="`${minuteFormatted}`">{{
              minuteFormatted }}</span>
          </span>{{ meridiem }}
        </p>
        <p class="">
          Palian Time
        </p>
      </div>
    </div>
  </ClientOnly>
</template>
