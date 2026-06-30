import { defineStore } from 'pinia'
const LATEST_CHANGELOG_VERSION = '2026-06-30_0.5a'

export const useChangelogTracker = defineStore('changelog', () => {
  const lastVisitedVersion = useLocalStorage<string | null>('changelog-last-visited', null)

  const hasUnread = computed(() => {
    return lastVisitedVersion.value !== LATEST_CHANGELOG_VERSION
  })

  function markAsVisited() {
    lastVisitedVersion.value = LATEST_CHANGELOG_VERSION
  }

  return {
    hasUnread,
    markAsVisited,
  }
})