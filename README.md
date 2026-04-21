# Reef Fish Survey Helper

![Fish Icon](fish.png)

**A Chrome extension that makes REEF fish survey identification easier with instant photo previews.**

Never wonder which fish you're entering again! This extension adds species photo thumbnails directly to reef.org survey forms, helping you jog your memory and save the headache of memorizing hundreds of species names.

## Why You'll Love It

- **Instant Recognition**: Hover over any species row to see a photo from iNaturalist
- **Memory Helper**: Perfect for when you know the fish but can't recall the exact name
- **Effortless**: No clicking, no extra tabs - just hover and see
- **Smart Caching**: Each species photo loads once per page, then appears instantly
- **Reliable**: Graceful fallback when photos aren't available

## Perfect For

**REEF Survey Volunteers** who want to:
- Fill out surveys faster and more confidently
- Double-check species identification without leaving the form
- Learn new species by visual association
- Reduce identification errors

## Installation

### Chrome Web Store (Recommended)
*Coming soon - install with one click from the Chrome Web Store*

### Developer Installation
1. Download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select the folder containing `manifest.json`
6. Navigate to any reef.org survey page and hover over species rows

### Browser Compatibility
- **Chrome/Chromium**: Fully supported
- **Firefox**: Compatible (manifest v3 support)
- **Edge**: Compatible (Chromium-based)

## How It Works

1. **Hover** over any species row in the REEF survey form
2. **See** an instant photo preview with species names
3. **Identify** with confidence and continue your survey

The extension fetches photos from [iNaturalist](https://www.inaturalist.org) - the world's largest nature observation platform - and caches them for instant repeat viewing.

## Privacy & Permissions

- **Minimal**: Only accesses reef.org survey pages
- **Secure**: Fetches photos from iNaturalist API (no API key required)
- **Local**: All processing happens in your browser
- **No Tracking**: No analytics or data collection

## Contributing

Want to help improve the extension? Contributions are welcome!

1. **File an issue** first to discuss your idea
2. **Fork** the repository
3. **Make your changes**
4. **Submit a pull request**

Common areas for contribution:
- UI/UX improvements
- Performance optimizations
- Bug fixes
- Documentation

## License

MIT License - feel free to use, modify, and distribute this extension.

## Support

- **Issues**: [Report bugs or request features](https://github.com/joranquinten/qtn.reef-id-fish-helper/issues)
- **Questions**: Open an issue on GitHub
- **Updates**: Check the repository for the latest version

---

*Made with by [Joran Quinten](https://github.com/joranquinten) for the REEF volunteer community*
