<script setup lang="ts">
useHead({
  title: 'Changelogs | Palia Garden Planner',
  meta: [
    {
      name: 'description',
      content: 'A log of changes made to the Palia Garden Planner',
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://palia-garden-planner.vercel.app/changelogs',
    },
  ],
})
</script>

<template>
  <main v-once class="flex flex-col gap-2 px-2 py-2 text-justify sm:px-4 lg:px-14">
    <NuxtLink to="/" class="flex items-center gap-2 btn w-fit btn-sm btn-ghost">
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="" />
      <p class="">
        Return
      </p>
    </NuxtLink>
    <section class="flex flex-col gap-2 pb-2">
      <div class="py-4">
        <h1 class="text-2xl font-bold md:text-3xl">
          Site Changelogs
        </h1>
      </div>

      <div class="grid gap-2">
        <ChangelogItem checked>
          <template #title>
            <span class="font-bold">
              July 6, 2025 — Dark Mode, Setting Presets</span>
          </template>
          <template #summary>
            <li>
              <span class="italic">Dark Mode UI — </span> Dark mode now enabled and configurable in UI Settings
            </li>
            <li>
              <span class="italic">Setting Presets — </span> You can now save and load settings in the settings' presets
              tab
            </li>
            <li>
              <span class="italic">Fix: Negative Displays — </span> Crop deficit now visible in the output display
            </li>
            
            <li>
              <span class="italic">Fix: Scrollbars — </span> Fixed issue with horizontal scrollbars not appearing
            </li>
            <li>
              <span class="italic">QoL Changes</span>
              <ul class="pl-3 list-disc list-inside text-sm">
                <li>Can now open up a new layout in a new tab</li>
                <li>New indicator for which crop takes the longest to process</li>
              </ul>
            </li>
          </template>
          <template #default>
            <p class="indent-6">
              Hello! I didn't like how the website look when browsers gave it its own dark mode,
              so I decided to implement my own take on it. It definitely matches the non-planner areas of the website,
              which feels more in-line with how I would've liked it.
              Regardless, feel free to revert to light mode in the UI settings. It should default to your system
              preferences so you can hard set it there instead.
            </p>

            <p class="indent-6">
              Setting presets are now a thing! The pre-crafter update planner had support for settings being auto-saved.
              With crafters in the mix, that system might've been inconvenient to re-implement 1 for 1. So, with
              settings now saveable, I've decided
              to make it so you can instead manually set a default settings. In addition, I've allowed the ability for
              you to have different setting configurations that you
              can manage in the new Settings Modal.
            </p>

            <p class="indent-6">
              Finally, some minor changes. Negative values will now show in the output tab. This was hidden by default,
              but it does lead to some layouts looking better than others.
              For transparency, it should now display crop deficits for when your layout can't support the replant
              costs. Also, you can now create a new layout in a new tab for convenience.
            </p>

            <div class="divider"></div>
            <p class="indent-6">
              As per usual, I may have missed some things with these changes and bugs could appear. Please
              report them or any other feedback on the Github or on my Discord.
              Both are available on the Footer area below.
            </p>
            <p class="indent-6">
              I'll next be looking at improving the garden displays next round,
              and then looking into ways to expand crafters or whether I'd go straight to the plot system re-write. See
              you till then!
              Happy Gardening!
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            <span class="font-bold">
              June 17, 2025 — Re-added Growth Tick Average for Processing</span>
          </template>
          <template #summary>
            <li>
              <span class="italic">New Processor Setting — </span> Planner can once again calculate gold average by
              total growth ticks even if crops are processed
            </li>
            <li>
              <span class="italic">Setting Tab Rename — </span> 'Harvester' setting tab now called 'General' tab to
              account for no longer being
              purely harvester-related options
            </li>
            <li>
              <span class="italic">Paliapedia Bug Fix — </span> Fixed bug where PaliaPedia's garden generator links were
              not being parsed properly
            </li>
          </template>
          <template #default>
            <p class="indent-6">
              Since the Garden Planner still does not factor in player's genuine playtime, calculating gold average via
              crafter time
              can sometimes feel like a side-grade or worse than the old method of averaging via gold tick even after
              processing. Other players may have also preferred this method for their calculations in general.
            </p>
            <p class="indent-6">
              To address this, I added a setting to utilise the old method,
              with the setting being saveable+shareable and displaying it differently to help discussion.
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            <span class="font-bold">
              May 22, 2025 — Fixes</span>
          </template>
          <template #summary>
            <li>
              <span class="italic">Processor Fix — </span> Fixed a bug where the processor was internally behaving as if
              the harvest won't
              finish processing by next harvest when it was, and vice versa.
            </li>
          </template>
          <template #default>
            <h4 class="font-bold text-xl">Harvest Fix</h4>
            <p class="indent-6">
              Highly embarassing bug.. A '<' to compare the timings of a process time and the process time was reversed.
                The UI's check was also inversed, meaning it would correctly display that a harvest won't be processed
                in time because the warning would be displayed if the processor would process in time. Another thanks to
                Ren for pointing this out! </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            <span class="font-bold">
              May 20, 2025 — Fixes</span>
          </template>
          <template #summary>
            <li>
              <span class="italic">Harvest Fix —</span> Star Chance not being properly factored in when using unstarred
              seeds/using seeds under-level 25
            </li>
            <li>
              <span class="italic">RE-ADDED*: Harvest By Day —</span> Re-added harvests-by-day, *but no produce
              conversion or gold output
            </li>
            <li>
              <span class="italic">RE-ADDED: Export by Image —</span> Re-added export by image
            </li>
            <li>
              <span class="italic">0.4 Upgrade —</span> Batterfly Beans code from `Bb` to `Bt`
            </li>
            <li>
              <span class="italic">House Planner —</span> Should now be usable again
            </li>
          </template>
          <template #default>
            <h4 class="font-bold text-xl">Harvest Fix</h4>
            <p class="indent-6">
              Hello folks. A major oversight has been done where crops were being rounded too early when harvesting.
              This likely made layouts for under level 25 players and/or layouts using unstarred seeds to be lower than
              promised. Huge thanks to Ren for seeing this one!
            </p>
            <p class="indent-6">
              My sincere apologies though. This was a pretty substantial change in profits especially for lower-levelled
              players,
              so the inaccuracies here should've been noticed sooner. I'll continue tweaking the planner and staying
              alert to any more inaccuracies, but
              do keep in mind that the planner's output calcs may not reflect the player experience 1:1.
            </p>
            <div class="divider"></div>
            <h4 class="font-bold text-xl">Other Changes</h4>
            <p class="indent-6">
              The harvest-by-day has been re-implemented, though lacking produce conversions. This helps at least with
              those looking to see when harvests overlap, with a new option to see exactly the days when a crop is
              harvested (plus other crops with it).
              Those looking at when a produce is available would not benefit still, as I'm somewhat towards furthering
              the planner as a '24/7 player' simulation.
              Do let me know your use-cases
              for the day-by-day if you want a specific feature implemented.
            </p>
            <p class="indent-6">
              We've updated to code 0.4. The main reason for this was that the Batterfly Beans had a potential to be
              auto-modded in the official Palia Discord, which the planner was initially built for.
              I've ensured the cropCodes and the settings should update properly but please hastily report if a save
              code is not properly updated.
            </p>
            <p class="indent-6">
              Export by Image should now work again. Good chance it breaks again though cause of how fickle it is. It
              should, however, now support Firefox and Mac Safari (iOS still broken)
            </p>
            <p class="indent-6">
              Finally, I've done some styling fixes to House Planner to make it working again after the recent updates
              broke it. Its developement is still
              halted, but it is promised that it will at least be maintained.
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            <span class="font-bold">
              May 15, 2025 — 0.191 Parity</span>
          </template>
          <template #summary>
            <li>
              <span class="italic">Added New Crops —</span> New crops now fully implemented
            </li>
            <li>
              <span class="italic">Bug fixes —</span> Patched out a lot of issues that came out due to the new update
            </li>
            <li>
              <span class="italic">Mild Changes</span>
              <ul class="pl-3 list-disc list-inside text-sm">
                <li>Hovering over a crop/fert in the selector now highlights their presence in the layout</li>
                <li>Quickly added a crafter tab to double-check the planner's time calculations</li>
                <li>Minor UI tweaks & fixes to improve the planner experience</li>
              </ul>
            </li>
          </template>
          <template #default>
            <p>
              Planner now has full support of the new crops.
              Major thanks to DuhScape & Ren this round for finding their growth and produce values!
            </p>
            <p>
              With this, I'll soon be re-implementing the features I mentioned in the May 12 update.
              In addition, the new features will also be looked at for issues & improvements
              so feel free to share any thoughts you may have on it.
            </p>
            <p>
              Thanks everyone for the wait.
              Please share any inaccuracies you may have found within my planner so I may look into it,
              as well as any other issues and feedback you may way to send my way. Happy Gardening!
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            <span class="font-bold">
              May 12, 2025 — Save'n Time Update (Major)</span>
          </template>
          <template #summary>
            <li>
              <span class="italic">Crafter Timings —</span> Crafters now have time support
            </li>
            <li>
              <span class="italic">In-Browser Saving —</span> Planner codes can now be saved within the browser
            </li>
            <li>
              <span class="italic">Setting Codes —</span> Settings can now be included in save codes
            </li>
            <li>
              <span class="italic">Harvester & Processor Overhaul —</span> Overhauled how crops are harvested and
              processed for better efficiency
            </li>
            <li>
              <span class="italic">New UI —</span> Cause I'm trying to fit everything in
            </li>
            <li>
              <span class="italic">QoL Changes</span>
              <ul class="pl-3 list-disc list-inside text-sm">
                <li>UI Settings can now hide tile bonus icons & background for less clutter</li>
                <li>Improved widget for item selection</li>
                <li>(Mobile) New modal for crop & fert selection</li>
                <li>(Keyboard) Shift + [CropCode] now selects a crop</li>
                <li>Last Harvest Day now automatically finds a day where all crops are harvestable (LCM Day)</li>
                <li>You can now have a duplicate settings for when everything's a bit chaotic</li>
              </ul>
            </li>
            <li>
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-warning" />
              <span class="italic pl-1 uppercase">To be re-added —</span> The following features have been temporarily
              removed and will be re-implemented:
              <ul class="pl-3 list-disc list-inside text-sm">
                <li>Harvests by Day (Will focus primarily on simulated harvests)</li>
                <li>Export as Image</li>
                <li>Your default settings being configurable</li>
                <li>Total/Average Gold being globally visible in settings</li>
              </ul>
            </li>
            <li>
              In addition, expect some fixes and improvements shortly after this update as I look for bugs, as
              well as including the new crops (should be quick if they have no new mechanics)
            </li>
          </template>
          <template #default>
            <p>
              Hi everyone, been awhile! Looks like the Elderwoods is here and so I must catch up!
              I shan't yap too much about where I've been, so I'll just move on to the changes at hand. Apologies for
              the wait
            </p>
            <div class="divider"></div>
            <h4 class="font-bold text-xl">New Crafter Timing Support & Saves</h4>
            <p class="indent-6">
              I've now added Crafter Time Support, and with it comes the ability to save and share setting
              configurations.
              This is the 2nd major milestone of the planner, with the next being a better support for off-set plots.
              This implementation took way longer than necessary to come up with. I was attempting to tinker with more
              ambitious scopes but had to ground myself to this one.
              Truth is I wanted a more experimental process, testing changes with a smaller set of players to test
              different solutions.
              However, after such a long time (sorry), I decided that this simple one should be good for a live test.
            </p>
            <p class="indent-6">
              Do see the Info tab in the Output Display to see some explanation on the processor!
              I belive the input will stay, with maybe an extra option or two, but I'll have to see if there's other
              internal implementations I can make to improve this.
            </p>
            <p class="indent-6">
              To help with the effort everyone'll go through messing with crafter configurations, I've also added the
              ability to add settings into the code.
              I've done my best to minimise its impact on the code length, so hopefully it won't be much of a hassle to
              share.
              I've also added browser-saving! So now you can quickly fetch and share them from within the website
            </p>
            <div class="divider"></div>
            <h4 class="font-bold text-xl">Harvester Improvements</h4>
            <p class="indent-6">
              While the processor was obviously going to be re-made, the harvester also got a massive change!
              The old method was <span class='italic'>incredibly</span> slow and inefficient, impeding the experience
              especially on long simulations.
              Thanks to the overhaul, simulating a large amount of days should now be faster, you can try simulating
              1.8k days of harvest now with a lot less lag!
              Unfortunately, this did mean I have to re-implement the day-by-day breakdown so stay tuned for that.
            </p>
            <p class="indent-6">
              This change also disentangled a lot of the messy code the planner initially had.
              While it's still not pristine, it's now both easier and more convenient for me to add new changes!
              I'm eyeing the ability to factor in fertiliser costs soon, as well as alternative ways to factor in
              replant costs.
              I'll be working on this after bug fixes, re-implementations, and new crops.
            </p>
            <div class="divider"></div>
            <h4 class="font-bold text-xl">QoL Changes</h4>
            <p class="indent-6">
              Outside of that, there should now be some new features to make things easier for your garden planning.
            </p>
            <p class="indent-6">
              Starting off, I've added a widget to sort crops by buffs.
              The truth is this is to condense the space of the crop buttons to handle new crops, but it also doubles as
              a filter!
              Furthermore, I've added some assistance to mobile users,
              you should now have a new button that lets you pick a crop without having to scroll al the way up.
              In addition, there's now a couple options in the new UI Settings modal to let you hide crop buff
              indicators.
              This should make things look a lot less cluttered, letting your eyes breathe a lil' easier!
            </p>
            <p class="indent-6">
              An LCM option got added to the harvest settings. One of many features that should've been here sooner tbh.
              This new default setting makes it so the last day has all your crops be ready for harvest, making it a
              nice way to round the simulation off.
              Speaking of, the output window as a whole is getting quite cluttered with these tabs, so I added the
              option to clone it!
              Feel free to leave the garden for a while while you mess with the configurations
            </p>
            <div class="divider"></div>
            <h4 class="font-bold text-xl">Closing Words</h4>
            <p class="indent-6">
              What a long post! Anyway, I'll be testing these changes as they come and will be polishing things up.
              In the meantime, feel free to report any issues, complaints, or suggestions you may have about the new
              changes! (.aisen on Discord)
            </p>
            <p>
              Thank you guys once again for your continued use of the planner. Happy planning and happy Elderwoods
              update!
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            October 18, 2024 — 2nd Internal Tweak
          </template>
          <template #summary>
            <li>
              Changed how images render to test performance improvements
            </li>
          </template>
          <template #default>
            <p class="indent-6">
              Hello! The last internal tweak proved to be beneficial in reducing host resource consumption without
              affecting user experience.
              As a result, another tweak is being implemented to optimise another aspect of the website.
            </p>
            <p class="indent-6">
              If you have been facing any issues since the update today or the previous one, please contact me on
              Discord below.
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            October 15, 2024 — Mild internal tweak
          </template>
          <template #summary>
            <li>
              Changed how images render to test performance improvements
            </li>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            May 28, 2024 — 0.180 Patch Parity
          </template>
          <template #summary>
            <li>
              <span class="italic">Apple & Blueberries Boost Change —</span> Apples and Blueberries now give Harvest
              Boost instead of Growth Boost
            </li>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            May 04, 2024 — Added Ko-fi Link
          </template>
          <template #summary>
            <li>
              <span class="italic">New Ko-Fi Link —</span> Added way to send tips
            </li>
          </template>
          <template #default>
            <p class="indent-6">
              Hi folks! The Garden Planner now has a Ko-fi link for those who wish to send tips.
              I've had a few requests for this, but I wanted to hold off till I had something more substantial to show
              for it.
            </p>
            <p class="indent-6">
              However, Garden Planner traffic has been increasing (woohoo!!). I'll soon no longer be able to host the
              server
              for free though, so I've decided to add the Ko-fi link now to help me cover the costs.
              Development continues when I can. I've got new plans for the crafters and how they'll fit in the planner
              that I hope
              will finally allow me to release them.
            </p>
            <p class="indent-6">
              Regardless, thank you guys so much for your continued support and use of the planner. I'm glad to see it's
              been useful to so many of you and I'm proud it's come to a point I have to consider server costs (though
              stressful).
              I intend on maintaining the planner for as long as I can, and I hope to continue to improve it.
            </p>
            <p>
              Have a great life everyone! Happy planning!
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            April 24, 2024 — Courtyard Patch and House Planner Halt
          </template>
          <template #summary>
            <li>
              <span class="italic">0.179 Parity —</span> Added the courtyard building
            </li>
            <li>
              <span class="italic">House Planner development now indefinitely halted —</span> Please see the
              <NuxtLink class="link" to="/house-planner">
                House Planner page
              </NuxtLink> for more information
            </li>
          </template>
          <template #default>
            <p>
              With the release of 0.179 comes the Courtyard building, a new housing add-on.
              Thank you to <span class="italic">CauldronMorgana</span> for confirming certain details about the
              Courtyard,
              as well as <span class="italic">TinyDragon</span> for the same reason as well as general housing
              information.
            </p>
            <p>
              As of this update, the House Planner development is indefinitely halted. I've evaluated that the prototype
              needs to be reworked from the ground up to better simulate the in-game housing system as well as support
              the upcoming features (such as the Structure Blocks and 2nd Floor).
            </p>
            <p>
              I've detailed the reasons for the halt on the bottom of the House Planner page.
              Overall, my prototype was just not feasible and I feel I do not have the time and resources to remake it
              in a way
              that fits my standards. For that, I've decided to halt development on the House Planner and simply
              maintain it for archival purposes.
            </p>
            <p>
              Garden Planner development still continues and I have no plans to halt it.
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            March 29, 2024 — Hallway Patch
          </template>
          <template #summary>
            <li>
              <span class="italic">0.178 Parity —</span> Made hallways not count towards the limit
            </li>
            <li class="ml-5">
              <span class="font-bold">NOTE:</span>
              This change was not in the patch notes, so please be aware that it may be a bug and may be reverted upon
              confirmation.
            </li>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            March 10, 2024 — New Star Chance Formula
          </template>
          <template #summary>
            <li>
              <span class="italic">New Level System —</span> Added new formula for calculating star chance
            </li>
            <li class="ml-5">
              Removed chance override options in favour of the new formula
            </li>
            <li>
              <span class="italic">Small UI Update —</span> Tweaked buttons to be more compact.
            </li>
          </template>
          <template #default>
            <p>
              New attempt at a level-based star-chance system, this time with a formula that can adapt to any level
              instead of just level 25.
              This change was originally intended to be part of the crafter update,
              but since that won't be out for a while (busy reasons, see Jan 30 update) I've decided to release that
              change now.
            </p>

            <p class="p-1 px-3 font-mono rounded-md bg-palia-blue">
              Formula:
              <code class="">0.25 + (0.25 * useStarSeeds) + (0.02 * level) + (0.5 * hasQualityBoost)</code>
            </p>
            <p class="text-sm">
              See Harvest Calculator Info > Assumptions for brief explanation
            </p>

            <p>
              This new formula is arbitrary and based off player observations, and is still not the actual in-game
              formula.
              Level 25+ players using star seeds shouldn't notice any difference from the old system provided the same
              settings are used. Pre-level 25 star-seed layouts should expect the same settings as a level 0.
            </p>
            <p>
              For players not using star seeds, the new system should hopefully provide a slightly more accurate
              representation of their star chance. Most notably, when you reach level 50, you should expect a 100%
              star chance with normal seeds. 100% is actually met earlier on at around level 38 as per the planner,
              whether that's accurate to in-game is debatable, but nevertheless should still be closer than the old
              formula.
            </p>
            <div class="divider" />
            <p>
              Minor UI tweaks in preparation of an internal UI update, as well as minor experimentation with making
              the planner more compact.
            </p>
            <p>
              UI changes are planned for the next major update (no ETA), with a specific focus to the harvest
              calculator.
              Many of my issues with the incoming updating has been the lack of space to fit everything in,
              so I'm making a smaller UI update to make the calculator more bearable to look at.
              In addition, I might look at better ways to display the crop/fertiliser buttons, as the increase of crops
              is going to make the buttons more cluttered.
            </p>
            <p>
              If you notice anything wrong, please report it to me on Discord <span class="font-bold">(.aisen)</span>
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            January 30, 2024 — New Crops, New Building
          </template>
          <template #summary>
            <li>
              <span class="italic">New Crops —</span> Added new crops from the 0.176 patch
            </li>
            <li class="ml-5">
              <span>HOTFIX: Bok choy star seed price was incorrectly valued at 30 gold instead of the right amount of 22
                (Credits: gazar)</span>
            </li>
            <li>
              <span class="italic">New Building —</span> Added the new bay window housing add-on
            </li>
            <li class="ml-5 font-bold">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-warning" />
              <span>
                NOTE: Bay Windows on the front of the Harvest House are not yet supported, it'll require a system
                re-write.
              </span>
            </li>
          </template>
          <template #default>
            <p>
              Hello everyone! This was a bit of a quick addition.
              Huge thanks to <span class="italic font-bold">Aschefield</span> and <span class="italic font-bold">Adain
                (Paliapedia)</span> for providing information and assets on the new crops and by-products!
              Their help certainly sped up syncing the planner with the new patch.
            </p>
            <p>
              There may be a chance I missed some values, so if you notice any discrepancies please do report it to me
              on Discord <span class="font-bold">(.aisen)</span>.
              Those of you who are using the House Planner may note an issue with the Bay windows, I'll need to re-work
              how the planner handles housing add-ons to support it so it would definitely take awhile.
            </p>
            <p>
              Apologies once more for the slow updates, I've been busy :(
              Please note that anyone willing to make alternative websites or improve on this one is more than welcome
              to do so.
              I'm currently searching for a job, so I'm not sure how much time I'll have to work on this.
              Consider updates to be much slower from now on until the situation changes.
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            November 13, 2023 — Mild Bugfixes
          </template>
          <template #summary>
            <li>
              House Planner
            </li>
            <li>
              <span class="ml-5">Experimental Release</span> - Added a proof of concept house planner: <NuxtLink
                class="link" to="/house-planner">
                Link Here
              </NuxtLink> (Warning: Heavily early stage, not recommended for regular use)
            </li>
            <li class="ml-5">
              <span class="italic">Bugfix</span> - Prevented hallways from connecting at the sides
            </li>
            <li class="ml-5">
              <span class="italic">Adjustment</span> - Gave most buildings a vertical roof for collision checks
            </li>
            <li>
              <span class="italic">UI</span> - Slightly tweaked UI for smaller screens and wider gardens
            </li>
            <li>
              <span class="italic">Compact View (Experimental)</span> - Added experimental compact view to support a
              potential feature on another website that's not mine to announce :D
            </li>
            <li class="ml-5">
              See here: <NuxtLink class="link" to="/compact">
                Compact View
              </NuxtLink>
            </li>
            <li class="font-bold uppercase">
              Update regarding crafters below
            </li>
          </template>

          <template #default>
            <p>
              Heya folks, small update this time round with a small focus on features unrelated to the garden planner.
            </p>
            <p>
              I've worked on the layout for the planner a bit, hopefully to support larger gardens and smaller screens a
              little.
              I meant to add a fix to the screenshot feature but it did not pan out.
            </p>
            <div class="divider" />
            <h3 class="text-lg font-bold">
              Crafter Support
            </h3>
            <p>
              Crafters are under construction! Files for them exist somewhere in the background.
              they support having limited slots and can properly calculate time spent processing
              regardless of the different crops inserted into each one.
              Information with and without idle time is also available.
            </p>
            <p>
              Not much work left on the crafters themselves as they're almost functional.
              The big problem is how they'll be managed and displayed.
              I intend to support the ability to calculate for total processing time
              given a number of crafters.
              Every crafter <span class="italic">will</span> support having different crops placed into each one.
            </p>
            <p>
              I have been mind-blocked on both how to manage and configure the crafters in a way that can reflect
              multiple
              playstyles.
              Not to mention that on release it'll likely need configuration saving and sharing, which is a whole other
              can of worms.
              Overall though, work is progressing on them, I hope to release them in a state that's satisfying.
            </p>
            <p>
              However, to make sure I implement them right, I plan on releasing them in an experimental page first.
              This was where the house planner came in, as a way to gauge how users react to experimental features.
            </p>
            <div class="divider" />
            <h3 class="text-lg font-bold">
              House Planner
            </h3>
            <p>
              The house planner is a proof of concept, and is not meant to be used regularly.
              Aside from being a way to gauge how users react to experimental features,
              it's also a highly demanded project that I've been wishing someone else would make.
              Since it's been months and I needed a change of gear to work on, I decided to make it myself.
            </p>
            <p>
              It's currently in it's early stages, and is currently not a reliable source of information on housing.
              It has a lot of inaccuracies, and is missing a lot of information.
              That said, having this out there will let me test for bugs much earlier,
              as I personally do not have the resources and space to test for housing.
            </p>
            <p>
              Hopefully, this will also encourage other developers to either improve on this or make their own versions.
              Otherwise, this opens up a new end goal of being the one-stop shop for simulating certain Palia mechanics.
            </p>
            <p>
              You may try it out yourself here: <NuxtLink class="link" to="/house-planner">
                House Planner
              </NuxtLink>
            </p>
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            October 15, 2023 — UI Rework
          </template>
          <template #summary>
            <li><span class="italic">UI Rework —</span> Reworked the UI to be more compact and reduce scrolling</li>
            <li><span class="italic">Palia Clock —</span>Adds an in-game timer for convenience</li>
            <li><span class="italic">Mechanic —</span> Added growth boost support (options)</li>
            <li>UX Improvements:</li>
            <ul class="pl-3 list-disc list-inside ">
              <li>You can drag crops/fertilisers to their tile</li>
              <li>You can now click on the save codes to copy to clipboard</li>
              <li>
                <span class="italic">(Desktop) —</span> Hovering over a tile now previews the crop/fertiliser being
                placed
              </li>
              <li>Main options now save automatically per browser</li>
            </ul>
            <li>Moved Credits to its own dedicated page</li>
            <li>Renamed approximations data to more accurately reflect the lack of crafter timings</li>
            <li>HOTFIX — Fixed issue with tomatoes when under growth boost</li>
          </template>
          <template #default>
            <p class="py-4 text-sm text-warning">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="" />
              UI using custom layouts is not final, and will be changed soon.
            </p>
            <p>
              This change is a major UI rework, with the aim of reducing scrolling and making the planner more compact.
              The initial design of the planner was added as an after-thought, and was not meant to be a long-term
              solution.
              Adding new features, and planning out future ones was proving to be a hassle with the current design, so I
              prioritised its re-work.
            </p>
            <p>
              The rework is designed by an amazing friend of mine, <span class="font-bold">frnkers</span>, and was
              translated to code by yours truly.
              This change allows me to comfortably add new features, and plan out future ones without worrying about the
              messiness of the UI.
            </p>
            <div class="divider my-0 w-full mx-auto max-w-[16rem] lg:max-w-sm" />
            <p>
              I've also added a couple new features, an in-game timer and growth boost support.
              Growth boost support is a toggle in the options menu as it's still bugged (and may work differently with
              fertilisers which is still untested),
              a lot of thanks to <span class="font-bold">gazar</span> for providing information regarding this mechanic.
            </p>
            <p>
              The in-game timer is a small nifty addition that mimics the in-game clock.
              I've initially added a 6 AM alarm (for harvests) but it was proving to be buggy due to how web
              notifications
              work.
              The alarm feature will be kept on the shelf until I find a better system for alarms.
            </p>
            <div class="divider my-0 w-full mx-auto max-w-[16rem] lg:max-w-sm" />
            <p>
              Overall, this update is late as I've taken a break.
              Health reasons and being busy with other stuff meant I couldn't follow my initial roadmap.
              I'm still working on the planner, but it'll be at a slower pace now and I'll be developing the planner
              at a more comfortable pace.
            </p>
            <p>
              If you ever want to contribute to the project's development, just know that the website is open-source and
              can be accessed in the footer below!
            </p>
          </template>
        </ChangelogItem>
        <ChangelogItem>
          <template #title>
            September 21, 2023 (Hotfix)
          </template>
          <template #summary>
            <li>Fixed price of corn preserves (Issue #31 - agazarkiewicz)</li>
          </template>
          <template #default>
            Prices of corn preserves were set to that of potato preserves, causing an overestimation of gold values.
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            September 15, 2023 (Hotfix)
          </template>
          <template #summary>
            <li>Adjusted seeds for 0.168.1 hotfix</li>
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            September 13, 2023 (Hotfix)
          </template>
          <template #summary>
            <li>Added corn and spicy pepper</li>
            <li>Fixed bug where remainders weren't being properly calculated in the planner</li>
            <li>Fixed huge oversight where bushes gave 4 crops per harvest when it actually gives 6</li>
          </template>
          <template #default>
            This hotfix adds the new crops added in the 0.168 patch.
            It also fixed some incorrect values that I've not detected for a long time.
            If you notice discrepancies in your harvest/gold values, please do report it to me on Discord <span
              class="font-bold">(.aisen)</span>
            as I tend to miss some values while working on the planner.
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            September 8, 2023
          </template>
          <template #summary>
            <li>Allowed for illegal plot amounts</li>
            <li>Added external tools</li>
          </template>
          <template #default>
            <span class="font-bold">Illegal Plots: </span>Requested feature, part as a way to support increased plot
            sizes
            in the future and as a temporary solution to support partially connected layouts.
            This change allows for layouts that exceed the maximum plot count of 9 (as of the current date).
            <br>
            <span class="font-bold">External Tools: </span>
            Added external links to other Palia tools, as part of mutual agreements to provide visibility to each
            other's
            tools.
            If you're a developer and would like to have your tool added, feel free to contact me on Discord! <span
              class="font-bold">(.aisen)</span>
            <br>
            Recent changes have been slow for various reasons, mostly the development of a small side-project that could
            be added on here.
            I'll soon return to the roadmap-schedule, potentially updating it to be more accurate.
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            September 2, 2023 (Hotfix)
          </template>
          <template #summary>
            <li>Fixed 2 bugs causing seed replants to not be calculated properly</li>
          </template>
          <template #default>
            This hotfix tackles a major bug that causes excess seeds to not be properly used in re-plants. It also fixes
            a
            bug where re-harvestable plants
            would have incorrect re-plant days when calculated for days above its regular lifespan.
            <br>
            The change should increase gold values by a variable amount and should now properly represent accurate
            replant
            deductions
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            August 30, 2023 (Hotfix)
          </template>
          <template #summary>
            <li>Adjusted crops consumed per seed for Tomatoes to match the 0.167 patch changes</li>
            <li>
              Fix to how crops consumed were being calculated that <span class="font-bold">shouldn't make anything
                different</span>
              (was only a rounding error for tomato seeds caused by the above change)
            </li>
          </template>
          <template #default>
            This change was added hastily, so if any bugs occur please report it to me on Discord <span
              class="font-bold">(.aisen)</span>
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            August 24, 2023
          </template>
          <template #summary>
            <li><span class="italic">New Content —</span> Added Fertiliser</li>
            <li>
              <span class="italic">Technical — </span> Upgraded save codes from v0.1 to v0.2 for fertiliser support
            </li>
            <li>
              <span class="italic">UI — </span> Shifted garden layout to accomodate fertilisers and be easier on the
              eyes
            </li>
            <li><span class="italic">Technical — </span>Removed save code from images exported using the planner</li>
            <li>
              <span class="italic">Technical — </span>Changed how the font is loaded to improve server bandwidth usage
            </li>
          </template>
          <template #default>
            <div class="flex flex-col gap-1">
              <p>
                Today's update adds a core gardening mechanic to the planner - <span
                  class="font-bold">Fertilisers</span>!
                Important for covering tiles that lack necessary bonuses, fertilisers are a great way to enhance your
                garden.
              </p>
              <p>
                Adding fertilisers required a mild overhaul to how saves function, so I've bumped up the save code
                version
                to v0.2 which shortens crop codes to allocate more room for fertiliser codes.
                Your v0.1 codes will still work, just load them in as usual and it'll be parsed correctly (if it
                doesn't,
                please report).
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-left">
                Fertilisers
              </h3>
              <p>
                Added Fertilisers support, fertilisers apply their specific bonus to the tile it's on for every-day that
                it is active.
                The planner will assume that each tile will have its applied fertiliser daily.
              </p>
              <p>
                Currently,
                <span class="font-bold">there is no cost reductions for having fertilisers</span>
                how fertilisers are acquired vary, and as such their costs are not consistent.
                It's highly likely I'll settle on their sell-price instead, but I'll take some time to decide on that
                fully.
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-left">
                v0.2 Saves
              </h3>
              <p class="indent-6">
                New save version includes shortened crop codes, with all crops having their codes reduced by 1 character
                (except for Cotton).
                Fertilisers are indicated by the dot <span
                  class="px-2 font-bold border border-solid rounded-lg border-info">.</span> prefix, followed by their
                code.
              </p>
              <p>
                As a core feature of the Garden Planner is 'Shareability',
                v0.1 codes are supported to ensure nobody's gardens are lost during the upgrade.
                Ideally, all codes will not be invalidated in the future,
                and will only be unsupported if gardening mechanics change to the point it becomes impossible.
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-left">
                UI/UX Changes and Other Stuff
              </h3>
              <p class="indent-6">
                The garden layout has been shifted to the right to accomodate fertilisers.
                Most elements were mostly shifted to make the high amount of information more bearable to look at.
                The current UI/UX of the app is showing a lot of flaws.
                A graphic designer friend of mine has offered to work on a better design when available,
                so a UI/UX re-design might not be far in the future.
              </p>
              <p>
                Outside of that, the new savecode-length makes it impossible to actually store the save in an image
                file.
                Due to this, I've removed it entirely from exported images.
              </p>
              <p>
                I truly apologise to anyone using smaller screens and anyone who are struggling with the current UI.
                Ease of use is another core aim of the planner, and I'll be working hard to make it better.
              </p>
            </div>
          </template>
        </ChangelogItem>

        <ChangelogItem>
          <template #title>
            August 22, 2023
          </template>
          <template #summary>
            <li><span class="italic">New Pages:</span> Changelogs and Roadmap</li>
            <li><span class="italic">Technical:</span> Moved website from Vue to Nuxt</li>
            <li><span class="italic">UI:</span> Shifted sections of the website around</li>
            <li><span class="italic">UI:</span> Made some elements smaller to fit better on mobile</li>
            <li><span class="italic">UI:</span> Removed some unnecessary text (just a bit &lt;3)</li>
          </template>
          <template #default>
            <div class="flex flex-col gap-1">
              <p>
                Today's update doesn't add much in terms of the planner itself,
                just mostly nerd stuff that might only be interesting to a small amount of people!
              </p>
              <p>
                For the rest of you though, I've added a roadmap and this new changelogs section so you can better keep
                track of what's going on!
                Accompanying it comes a new sidebar and navbar, which will create room for more pages in the future
                (Presets/Templates :D).
                <span class="font-bold">Also, since the internal structure of the website has changed, I'd like to ask
                  for
                  reports on any performance issues
                  you may encounter, especially on mobile devices.</span>
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-left">
                New Pages: Changelogs and Roadmap
              </h3>
              <p class="indent-6">
                I've mostly been announcing on the official Palia Discord server whenever I've made a new update to the
                planner, particularly the
                chill channel for its slow pace.
                It's not really the best place to share updates nor a fitting place for them at all,
                and I'm not interested in making my own Discord server for the planner.
              </p>
              <p class="indent-6">
                These new changelogs and roadmap pages will allow me to better share what's changed and what's coming up
                in the future,
                not only will they be more accessible to everyone, but I can also write in greater detail. (I will
                though
                learn to be more concise in the future.)
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-left">
                Website Internal Structure
              </h3>
              <p class="indent-6">
                The planner ran on <span class="italic font-bold ">Vue</span>,
                the front-end framework I'm highly familiar working with that lets me develop this client app at a
                comfortable pace.
                Some of the ideas I have in mind in the long term though would likely benefit from having the planner
                have
                server-side capabilities,
                such as an internal link shortener, or an <span class="font-bold">API for other developers to
                  use</span>.
              </p>
              <p class="indent-6">
                Due to that, I've decided to save myself potential future troubles by migrating from Vue to <span
                  class="italic font-bold">Nuxt</span>
                as early as possible before the planner becomes open to the public.
                This also lets me better analyse the website performance of the planner, allowing me to deliver a better
                experience for you all.
              </p>
              <p>
                These changes took me a while though, I may have also caused some bugs in the migration, so please
                inform
                me of anything broke!
              </p>
            </div>
          </template>
        </ChangelogItem>
      </div>
    </section>
  </main>
</template>
