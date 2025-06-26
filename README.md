# Quartz Clickable Images Zoom plugin
Enables Lightbox zoom for [Quartz](https://github.com/jackyzha0/quartz) built websites.

Video showcase:

https://github.com/user-attachments/assets/8ba68c0e-5f9f-4be1-82b7-643ff1469ccb

You can check it out here - https://vazome.tech/

To enable:
- Add file `clickableImages.ts` to your `quartz\plugins\transformers\`
- Append line `export { ClickableImages } from "./clickableImages"` to your `quartz\plugins\transformers\index.ts`
- Place line `Plugin.ClickableImages(),` to your `quartz.config.ts` in the end of `plugins: { transformers:` section





