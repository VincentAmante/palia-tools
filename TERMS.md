# Terms of Use & Intellectual Property

This document outlines the usage terms for code, visual assets, editorial content, branding, and third-party intellectual property in the Palia Garden Planner project (`palia-garden-planner.vercel.app`).

💡 **In Plain English (Non-Binding Summary)**

* **1. Code & App UI (MIT License):** Anyone can inspect, fork, modify, and reuse the source code, algorithms, grid logic, UI components, and styles under the MIT License. However, the MIT License applies **only** to the functional codebase and explicitly excludes proprietary visual branding and third-party game assets.
* **2. Guides & Editorial Content (CC BY-NC 4.0):** Standalone written user documentation, changelogs, roadmaps, and site copywriting are licensed under standard Creative Commons BY-NC 4.0 (attribution required, non-commercial). Technical in-app tooltips required for UI functionality are included with the codebase under the MIT License.
* **3. Visual Branding & Support Links (Reserved Rights):** Custom logos, site graphics, maintainer identity, and donation links are strictly reserved and exempt from open-source licenses. Public forks using our MIT code must rebrand—you cannot host a clone using our logos or name, nor redirect support links while retaining our branding.
* **4. Third-Party Game IP:** "Palia" and all game assets (icons, crop graphics, item lore) belong exclusively to Singularity 6, Corp. They are not covered by our MIT License or CC license and cannot be commercialized or sold under any circumstances.
* **5. Community Fail-Safe (Abandonware Waiver):** If the official production site goes offline or breaks after a major game update, AND the maintainer completely ghosts the project for 45+ days without public notice or response to public contact (GitHub Issue or official contact email), branding restrictions are temporarily waived so the community can rehost the service.

(Note: This summary is provided for convenience only. The formal terms below govern the use of this project and repository.)

---

## 1. Code & Functional Planner UI — MIT License

The **[MIT License](LICENSE.md)** applies strictly to:

* All functional application source code, algorithms, calculations, state management logic, grid layout logic, and build scripts in this repository.
* Interactive application components, layout code, item selectors, modal interfaces, and component styling directly used to operate the functional application.
* **Embedded Technical Tooltips:** In-app operational descriptions (e.g., the info-tab), formula descriptions, and inline tooltips directly integrated within the functional interface to explain features. Does NOT include the content of externally linked guides.  

### Important Exclusions from the MIT License

The MIT License **does NOT grant rights** to:

1. Proprietary visual brand assets, logos, and custom site identity graphics (governed by **Section 3**).
2. Third-party game intellectual property, artwork, icons, trademarks, or proprietary game data owned by Singularity 6, Corp. (governed by **Section 4**).

Community members and developers are free to inspect, fork, modify, redistribute, and reuse these functional application components in their own projects—including competing tools—under the terms of the MIT License, provided they comply with the mandatory rebranding rules in Section 3 and third-party IP restrictions in Section 4.

---

## 2. Documentation & Editorial Content — CC BY-NC 4.0

The following written materials are licensed strictly under standard **[Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/)**:

* Standalone written changelogs, update logs, roadmap documentation, and general site copywriting outside of embedded functional UI tooltips.

Under this license, you are free to copy, share, adapt, and build upon these written materials for non-commercial purposes, provided appropriate attribution is given to Vincent Amante / `.aisen`. No additional custom legal restrictions are attached to this Creative Commons license.

---

## 3. Site Identity, Visual Branding & Anti-Impersonation — Reserved Rights

The following assets and identity markers are **exempt from both the MIT License and CC BY-NC 4.0**, and remain protected under reserved copyright and proprietary Terms of Use:

* **Visual Brand Assets:** Custom logos, site-specific graphics, original icon artwork, custom header/footer identity elements, and distinct site design themes.
* **Service Identity & Domain:** The official domain identity (`palia-garden-planner.vercel.app`) and maintainer branding (`.aisen`).
* **Support Endpoints:** Maintainer attribution, social links, and embedded donation integrations (e.g., Ko-fi buttons, tipping channels).

### Mandatory Rebranding & Anti-Impersonation Rules

To protect community members from deceptive mirror sites, phishing attempts, and malicious forks:

1. **Mandatory Rebranding:** Any public fork or re-hosted build utilizing the MIT-licensed code must replace site logos, distinct brand graphics, and site titles with original branding to clearly distinguish it from the official service.
2. **No Passing Off:** You may not host a fork that uses the title "Palia Garden Planner" or any substantially similar mark in a manner that creates likelihood of confusion or falsely represents the build as an official mirror, endorsement, or direct continuation (except under Section 5).
3. **Support Link & Attribution Integrity:** Public forks must not retain the original maintainer's branding or attribution while redirecting financial support/donation links to third-party endpoints. Downstream forks removing maintainer attribution must also remove official branding and support widgets.

---

## 4. Third-Party Game IP & Trademarks (Singularity 6, Corp.)

* **Palia**, along with its associated game artwork, item icons, game lore, mechanics data, and trademarks, are the exclusive intellectual property of **Singularity 6, Corp.**
* This project (`palia-garden-planner.vercel.app`) is an unofficial, community-made fan tool and is **not** endorsed, sponsored, or affiliated with Singularity 6, Corp.
* All game assets used in this repository are included strictly under non-commercial fan-content guidelines. **Neither the MIT License nor CC BY-NC 4.0 extends commercial or unrestricted rights to Singularity 6's proprietary assets.**
* Downstream developers who fork this repository are individually responsible for ensuring their use of Singularity 6 assets complies with Singularity 6's Fan Content Policy and Terms of Service. Downstream users may not monetize or sell builds containing Singularity 6 assets.
* The reservation of the project title "Palia Garden Planner" in Section 3 is an internal community usage restriction meant solely to prevent service impersonation within the fan community, and confers no trademark, copyright, or legal rights over Singularity 6's proprietary marks.

---

## 5. Community Continuity & Downtime Waiver (Fail-Safe)

To ensure the community always maintains access to a functional garden planning tool, the brand identity, anti-impersonation, and site-rehosting restrictions outlined in **Section 3** are temporarily waived if **ANY** of the primary triggers occur **AND** all maintainer inactivity conditions are met.

### Primary Triggers (Must meet at least ONE)

1. **Extended Unavailability:** The official production site (`palia-garden-planner.vercel.app`) has been completely offline or unreachable for more than **60 consecutive days**.
2. **Outdated Game Data Following an Official Patch:** Singularity 6 publishes official patch notes announcing additions or mechanical overhauls to core gardening mechanics (crops, fertilizers, bonuses, grid rules) that render key & existing planner features inaccurate or broken, AND the planner has not been updated to address those specific changes within **45 consecutive days** of that patch going live.

### Maintainer Inactivity Conditions (MUST ALL BE MET)

The continuity waiver activates **ONLY IF ALL** of the following conditions are met:

* **No Official Status Notice:** The primary maintainer has **not** posted any public status update, roadmap note, GitHub issue response, or site announcement acknowledging the delay, technical limitations, or deliberate decision regarding the update.
* **Unanswered Public Contact:** Publicly verifiable attempts to contact the primary maintainer regarding the downtime or missing game data go unanswered for **45 consecutive days**.
  * **Verifiable Contact Channels:** Contact attempts must be submitted via at least one of the following official public channels:
    1. Opening a public GitHub Issue on the official repository (`palia-tools`).
    2. Sending an email to the designated maintainer contact address listed in the repository root (`README.md` / `crown.aisen@gmail.com`).
  * *Note: Direct Messages on third-party platforms (e.g., Discord DMs) do not count toward the 45-day timer due to delivery and privacy verification limitations.*

### Exclusions & Safe Harbors

The continuity waiver **DOES NOT** apply if:

* **Communicated Delays:** The maintainer has posted an official notice (e.g., via GitHub Issue, roadmap update, or site banner) acknowledging a delay, technical limitation, or intentional decision to defer/exclude a feature.
* **Unannounced / Stealth Updates:** Data tweaks or stealth updates by Singularity 6 that are not documented in official published patch notes do not trigger the 45-day patch timer until a public issue report is filed on GitHub and maintainer inactivity conditions are met.
* **Unsupported Scope:** Features, adjacent game mechanics (e.g., cooking recipes, worm farms), or complex calculations that the live build does not already support are excluded from this clause.

### Effect of Waiver

Under these specific circumstances of complete maintainer absence without notice, community members are granted a temporary, non-exclusive license to rehost the full application—including existing branding, shell elements, and support links—to maintain service continuity for the community until the official maintainer returns.
