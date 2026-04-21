# Reef Fish Survey Helper

A Firefox browser extension that adds species photo thumbnails to the
[reef.org](https://reef.org) fish survey form. Hover over any species row
to see a photo fetched from [iNaturalist](https://www.inaturalist.org),
alongside the common and scientific names.

## Features

- 🐠 Photos fetched on hover — no network traffic until you need it
- 🗂 In-memory cache — each species is fetched at most once per page load
- 🔵 Highlighted row outline on hover so you always know what you're looking at
- 🦈 Graceful fallback emoji when a species has no photo in iNaturalist
- ✅ No API key required

## Files

```
reef-fish-helper/
├── manifest.json   — Extension manifest (Firefox MV2)
├── content.js      — Content script: tooltip logic & iNaturalist fetch
├── content.css     — Tooltip styles
└── README.md       — This file
```

## Installation (Temporary / Developer)

1. Open Firefox and navigate to `about:debugging`
2. Click **This Firefox** in the left sidebar
3. Click **Load Temporary Add-on…**
4. Browse to this folder and select `manifest.json`
5. The extension is now active — navigate to a reef.org survey page and hover
   over any species row

> **Note:** Temporary add-ons are removed when Firefox restarts.
> For a permanent install, the extension would need to be signed by Mozilla.

## Permanent Installation (self-signed)

If you want it to persist across restarts without going through Mozilla's
review process, you can use **Firefox Developer Edition** or **Firefox Nightly**
with `xpinstall.signatures.required` set to `false` in `about:config`.
Then package the extension:

```bash
cd reef-fish-helper
zip -r reef-fish-helper.xpi manifest.json content.js content.css
# Open the .xpi in Firefox to install permanently
```

## How it works

For each species row (`<tr class="fishdarkcolor|fishlightcolor|fishrarecolor">`),
the content script:

1. Attaches `mouseenter` / `mouseleave` listeners on page load
2. On hover, parses the scientific name from the `<i>` tag in the row
3. Queries `api.inaturalist.org/v1/taxa?q={name}&order_by=observations_count`
4. Shows the first result's `default_photo.square_url` in a floating tooltip
5. Caches the result so repeat hovers are instant

Fetches are aborted via `AbortController` if you move to a different row
before the previous one completes.
