# Quartz Clickable Image Zoom plugin
Enabled Lightbox zoom for Quartz built websites.

Video showcase:

<video controls src="20250622-1026-47.3163320.mp4" title="Title"></video>

To enable:
- Add file `clickableImages.ts` to `quartz\plugins\transformers\`
- Append line `export { ClickableImages } from "./clickableImages"` to `quartz\plugins\transformers\index.ts`
- Place line `Plugin.ClickableImages(),` to `quartz.config.ts` in the end of `plugins: { transformers:` section
