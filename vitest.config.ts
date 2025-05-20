import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
    test: {
        include: ['**/*.{test,spec}.{js,ts}'],
        environment: 'happy-dom', // or 'jsdom' for DOM testing
        setupFiles: ['./__mocks__/canvas.ts']
    }
})