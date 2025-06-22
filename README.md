# Quartz Clickable Images Zoom plugin
Enabled Lightbox zoom for Quartz built websites.

Video showcase:

<video controls src="20250622-1026-47.3163320.mp4" title="Title"></video>

To enable:
- Add file `clickableImages.ts` to your `quartz\plugins\transformers\`
- Append contents of `custom.scss` to your `quartz\styles\custom.scss`
- Append line `export { ClickableImages } from "./clickableImages"` to your `quartz\plugins\transformers\index.ts`
- Place line `Plugin.ClickableImages(),` to your `quartz.config.ts` in the end of `plugins: { transformers:` section
