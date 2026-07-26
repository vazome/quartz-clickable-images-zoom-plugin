# Quartz Clickable Images Zoom plugin

Enables Lightbox zoom for [Quartz](https://github.com/jackyzha0/quartz) built websites.

Video showcase:

https://github.com/user-attachments/assets/8ba68c0e-5f9f-4be1-82b7-643ff1469ccb

You can check it out here - https://vazome.tech/

## Quartz v5

```bash
npx quartz plugin add github:vazome/quartz-clickable-images-zoom-plugin
```

That's it — the plugin ships a pre-built `dist/`, so there is nothing to install or
compile. The command adds it to your `quartz.config.yaml`:

```yaml
plugins:
  - source: github:vazome/quartz-clickable-images-zoom-plugin
    enabled: true
```

It registers as a transformer at order `50` and has no options. Order does not
matter: the plugin only tags images, and the lightbox reads the browser-resolved
`img.src` at click time, so it works whether it runs before or after `crawl-links`.

## Quartz v4

The original single-file version lives in [`legacy/v4/clickableImages.ts`](legacy/v4/clickableImages.ts):

- Add `clickableImages.ts` to your `quartz/plugins/transformers/`
- Append `export { ClickableImages } from "./clickableImages"` to your `quartz/plugins/transformers/index.ts`
- Place `Plugin.ClickableImages(),` in your `quartz.config.ts` at the end of the `plugins: { transformers:` section

This file is frozen — new work happens against v5.

## Development

```bash
npm install
npm run build   # rebuilds dist/ — commit it, Quartz installs from it
npm test        # builds, then runs the smoke test
```
