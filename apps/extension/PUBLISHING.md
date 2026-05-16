# 🚀 Chrome Web Store Publishing Guide

> Complete step-by-step guide to publish the LifeSolver extension to the Chrome Web Store.

---

## Prerequisites

- [ ] A Google account
- [ ] One-time $5 developer registration fee
- [ ] The built extension ZIP (generated via `npm run build:store`)

---

## Step 1: Register as a Chrome Web Store Developer

1. Go to **https://chrome.google.com/webstore/devconsole**
2. Sign in with your Google account
3. Accept the Developer Agreement
4. Pay the one-time **$5 registration fee** (via Google Payments)
5. Wait for verification (usually instant, sometimes takes a few hours)

---

## Step 2: Build the Extension Package

From the **repository root**, run:

```bash
npm run build:extension
```

Or from `apps/extension/`:

```bash
npm run build:store
```

This will:
1. Compile TypeScript
2. Build the Vite/CRXJS production bundle to `dist/`
3. Create a ZIP file at `store-builds/lifesolver-extension-v1.0.0.zip`

---

## Step 3: Upload to Chrome Web Store

1. Go to **https://chrome.google.com/webstore/devconsole**
2. Click **"New Item"** (big blue button)
3. Click **"Upload a ZIP file"**
4. Select `apps/extension/store-builds/lifesolver-extension-v1.0.0.zip`
5. Wait for upload and validation to complete

---

## Step 4: Fill in Store Listing

### Required Fields

| Field | Value |
|-------|-------|
| **Name** | LifeSolver: The Growth Hacker |
| **Summary** (132 char) | Replace distractions with productivity. Track usage, block social media, earn focus credits, and sync with LifeSolver. |
| **Description** | See below |
| **Category** | Productivity |
| **Language** | English |

### Store Description (copy-paste this):

```
LifeSolver: The Growth Hacker — Transform your browser into a productivity powerhouse.

🧠 WHAT IT DOES
LifeSolver replaces mindless scrolling with intentional action. It sits quietly in your browser, tracking your digital habits and applying science-backed friction techniques to keep you focused.

📊 INTELLIGENCE DASHBOARD
• Real-time website usage analytics with interactive charts
• Hourly activity heatmap to identify your "peak distraction" hours
• Domain-level time tracking across every site you visit
• Synced task and habit data from your LifeSolver account

⚙️ GROWTH HACKER FRICTION ENGINE
• Grayscale Mode — desaturates distracting sites to reduce their appeal
• Doom Bumper — breathing exercises before accessing social media
• Heavy Scroll — physical resistance on infinite feeds
• Cognitive Bypass — confirmation prompts to break reflexive browsing
• Temporal Friction — increasing blur as you exceed healthy time limits
• Pay-to-Play — earn Focus Credits through productivity, spend them on leisure
• Feed Eradicator — hides infinite feeds while keeping search functional

🛡️ DETOX MODE
• 30min to 8-hour hardcore focus sessions
• Complete blocking of social media and custom sites
• Anti-quit protocol with OTP verification and math challenges
• Progress ring and countdown timer

🤖 AI SIDEKICK
• Chat with Orbit AI that knows your tasks, habits, and budget
• Context-aware productivity coaching
• Task breakdown and habit optimization suggestions

🔗 SEAMLESS SYNC
• Automatically syncs with your LifeSolver web app account
• Offline-capable — works without internet
• Secure authentication with token-based sync

💎 PREMIUM EXPERIENCE
• Cyber-noir dark aesthetic with glassmorphism
• Micro-animations powered by Framer Motion
• Zero-friction onboarding — just log in

🔒 PRIVACY
• No data sold to third parties
• No ads, no tracking scripts
• Your usage data stays in your account
• Full privacy policy at: https://life-solver.vercel.app/privacy-policy

LifeSolver: Turning the internet into a tool, not a trap.
```

---

## Step 5: Upload Store Assets

### Required Images

| Asset | Size | Location |
|-------|------|----------|
| **Extension Icon** | 128×128 PNG | `public/icon-128.png` (already exists) |
| **Screenshot 1** | 1280×800 or 640×400 | `store-assets/screenshot-*.png` |

### Recommended Images

| Asset | Size | Purpose |
|-------|------|---------|
| **Small Promo Tile** | 440×280 | Shown in search results |
| **Large Promo Tile** | 920×680 | Featured in categories |
| **Marquee** | 1400×560 | Homepage featured banner |

> 💡 **Tip**: Generate screenshots by loading the extension in Chrome DevTools, setting viewport to 1280×800, and capturing the popup UI.

---

## Step 6: Privacy Practices

Fill in the Chrome Web Store privacy tab:

### Permission Justifications

| Permission | Justification |
|-----------|---------------|
| `storage` | Stores user settings, cached data, and browsing usage analytics locally |
| `tabs` | Tracks active tab domain for usage analytics and friction features |
| `alarms` | Schedules periodic data syncs and detox timer countdowns |
| `activeTab` | Allows popup interaction with the current page |
| `<all_urls>` | Required to inject content scripts for focus gates, feed hiding, scroll friction, and visual friction across all websites |

### Privacy Policy URL

```
https://life-solver.vercel.app/privacy-policy
```

### Single Purpose Description

```
This extension helps users reduce digital distractions by tracking website 
usage, applying focus-enhancing friction techniques (grayscale, breathing 
gates, scroll resistance), and syncing productivity data with the LifeSolver 
web app.
```

### Data Use Disclosures

- **Personally identifiable information**: YES — email and name (for account sync)
- **Health information**: NO
- **Financial information**: YES — budget data (synced from user's own account)
- **Authentication information**: YES — auth tokens (for secure sync)
- **Personal communications**: NO
- **Location**: NO
- **Web history**: YES — domain-level usage time (for productivity analytics)
- **User activity**: YES — friction interactions (gates, bumpers, journals)

**Data sold to third parties?**: NO  
**Data used for purposes unrelated to the extension?**: NO

---

## Step 7: Submit for Review

1. Review all fields one final time
2. Click **"Submit for Review"**
3. Google will review the extension (typically 1-3 business days)
4. You'll receive an email when approved or if changes are needed

---

## Step 8: Post-Publishing

After your extension is approved and published:

1. **Copy the extension ID** from the Chrome Web Store URL:
   ```
   https://chrome.google.com/webstore/detail/lifesolver-the-growth-hacker/EXTENSION_ID_HERE
   ```

2. **Update the install banner URL** in the web app:
   ```
   apps/web/frontend/web-app/src/components/ui/ExtensionInstallBanner.tsx
   ```
   Replace `YOUR_EXTENSION_ID_HERE` with your actual extension ID.

3. **Deploy the web app** so the install banner goes live.

---

## Updating the Extension

1. Bump the `version` in both `manifest.json` and `package.json`
2. Run `npm run build:store` to create a new ZIP
3. Go to Developer Console → click your extension → **"Package"** tab
4. Click **"Upload new package"** and select the new ZIP
5. Submit for review again

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Upload rejected | Check ZIP contains `manifest.json` at root level, not nested in a folder |
| Permission warning | Ensure all permissions in manifest have justification text in the Privacy tab |
| Review rejected | Read the rejection email carefully — usually about permission justification or misleading description |
| Build fails | Run `npm run build` first to check for TypeScript errors |

---

*Last updated: May 2026*
