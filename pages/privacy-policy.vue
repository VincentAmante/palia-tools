<script setup lang="ts">
useHead({
    title: 'Privacy Policy | Palia Garden Planner',
    meta: [
        {
            name: 'description',
            content: 'Privacy Policy',
        },
    ],
    link: [
        {
            rel: 'canonical',
            href: 'https://www.palia-garden-planner.vercel.app/credits',
        },
    ],
})
</script>

<template>
    <main class="flex flex-col gap-2 px-2 py-2 text-justify md:px-8 lg:px-12">
        <NuxtLink to="/" class="flex items-center gap-2 btn w-fit btn-sm btn-ghost" :prefetch="false">
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="" />
            <p class="">
                Return
            </p>
        </NuxtLink>
        <div class="py-4">
            <h1 class="text-2xl font-bold md:text-3xl">
                Privacy Policy
            </h1>
        </div>
        <section class="rounded-md bg-palia-blue-dark sm:p-4 flex flex-col gap-4 p-1">
            <div class="flex flex-col p-4">
                <h2 class="sr-only">Dates</h2>
                <p class="text-sm">
                    Effective Date: July 14, 2025
                </p>
                <p class="text-sm">
                    Last Updated: July 14, 2025
                </p>
            </div>
            <div class="flex flex-col gap-8 p-4">
                <div class="flex flex-col gap-1">
                    <h2 class="text-2xl font-bold">1. What Data We Collect</h2>
                    <p>
                        We do not collect or request any personally identifiable information (PII), such as your name,
                        email, or location.
                    </p>
                    <p>
                        The only data stored locally on your device includes:
                    </p>
                    <ul class="list-disc list-inside">
                        <li>Save data (e.g. garden saves, settings)</li>
                        <li>User preferences (e.g., dark mode, ui options, default saves)</li>
                        <li>This data is stored using your browser's localStorage, and never leaves your device.</li>
                    </ul>
                </div>

                <div class="flex flex-col gap-1">
                    <h2 class="text-2xl font-bold">2. Third-Party Services</h2>
                    <p>
                        To operate efficiently, this site uses the following external services:
                    </p>
                    <h3 class="text-xl font-semibold">Vercel</h3>
                    <ul class="list-disc list-inside">
                        <li>This site is hosted on Vercel.</li>
                        <li>Vercel may log IP addresses and basic request metadata (e.g., browser type, request time)
                            for security and performance monitoring.</li>
                        <li>Vercel is GDPR-compliant and acts as a data processor under EU law.</li>
                        <li>
                            More: <a class="text-blue-600 underline" href="https://vercel.com/legal/privacy-policy"
                                target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a>
                        </li>
                    </ul>
                    <h3 class="text-xl font-semibold">Bunny CDN</h3>
                    <ul class="list-disc list-inside">
                        <li>Static assets (like images or scripts) are delivered using Bunny CDN.</li>
                        <li>Bunny CDN may temporarily log IP addresses to prevent abuse and improve delivery speed.</li>
                        <li>They do not store personal data beyond what is required for operation.</li>
                        <li>
                            More: <a class="text-blue-600 underline"
                                href="https://bunny.net/privacy/" target="_blank"
                                rel="noopener noreferrer">Bunny.net Data Protection Policy</a>
                        </li>
                    </ul>
                </div>

                <div class="flex flex-col gap-1">
                    <h2 class="text-2xl font-bold">3. Cookies and Tracking</h2>
                    <p>
                        This site:
                    </p>
                    <ul class="list-disc list-inside">
                        <li>Does <strong>not</strong> use cookies.</li>
                        <li>Does <strong>not</strong> use tracking tools (e.g., Google Analytics, Facebook Pixel).</li>
                        <li>Does <strong>not</strong> use fingerprinting, advertising scripts, or social media trackers.
                        </li>
                    </ul>
                </div>

                <div class="flex flex-col gap-1">
                    <h2 class="text-2xl font-bold">4. Your Data Rights</h2>
                    <p>
                        Since no personal data is collected, we have nothing to provide, delete, or correct. However,
                        you can always clear saved preferences by:
                    </p>
                    <ul class="list-disc list-inside">
                        <li>Clearing your browser’s site data/cache.</li>
                        <li>Using your browser’s developer tools to manually clear localStorage.</li>
                    </ul>
                </div>

                <div class="flex flex-col gap-1">
                    <h2 class="text-2xl font-bold">5. Changes to This Policy</h2>
                    <p>
                        We may update this policy to reflect changes to site behavior or third-party services. Check
                        back occasionally if concerned.
                    </p>
                </div>

                <div class="flex flex-col gap-1">
                    <h2 class="text-2xl font-bold">6. Contact</h2>
                    <p>
                        If you have any questions or concerns, you may reach out via Discord or Github, see below:
                    </p>
                </div>
            </div>

        </section>
    </main>
</template>
