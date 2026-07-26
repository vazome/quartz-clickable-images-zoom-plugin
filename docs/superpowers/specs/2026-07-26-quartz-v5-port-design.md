# Quartz v5 port — design

Closes [#1](https://github.com/vazome/quartz-clickable-images-zoom-plugin/issues/1).

## Problem

The plugin ships as a single loose `clickableImages.ts` that users drop into
`quartz/plugins/transformers/` — the Quartz v4 model. Quartz v5 replaced that
with standalone plugin repos installed via `npx quartz plugin add github:<repo>`.
v5 users have no way to install this plugin.

## Goal

Make the repo installable by Quartz v5 while keeping v4 users working, and
prepare the entry for the Quartz community plugin listing.

## Layout

```
src/index.ts                    v5 plugin source
legacy/v4/clickableImages.ts    current file, moved unchanged
dist/                           built output — committed, v5 installs from it
package.json                    npm manifest + "quartz" manifest block
tsup.config.ts
tsconfig.json
test/smoke.mjs                  runnable check against dist/
README.md                       v5 install first, v4 section below
community-entry.md              one-line snippet for the Quartz community PR
```

## The port

The only source change is the import:

```diff
-import { QuartzTransformerPlugin } from "../types"
+import type { QuartzTransformerPlugin } from "@quartz-community/types"
```

Verified against `quartz-community/types@HEAD`:

- `QuartzTransformerPluginInstance` still exposes `name`, `htmlPlugins`, `externalResources`.
- `CSSResource = { content: string; inline?: boolean; spaPreserve?: boolean }` — unchanged.
- `JSResource` inline variant is still `{ loadTime, contentType: "inline", script }` — unchanged.

So `htmlPlugins()` and `externalResources()` carry over verbatim. No behavioural change.

## package.json `quartz` manifest

```json
{
  "name": "clickable-images",
  "displayName": "Clickable Images Zoom",
  "category": "transformer",
  "quartzVersion": ">=5.0.0",
  "dependencies": [],
  "defaultOrder": 50,
  "defaultEnabled": true,
  "defaultOptions": {},
  "optionSchema": {}
}
```

`defaultOrder: 50` puts it late in the transformer chain, matching its v4
position at the end of `plugins.transformers` — image `src` values must already
be resolved when the visitor runs.

## Deliberate omissions

Taken from `quartz-community/plugin-template`, then cut:

- **CSS and JS stay as inline template literals in `src/index.ts`**, not `.scss` +
  `.inline.ts` files. Drops the esbuild inline-script loader, the sass loader, and
  the `validate-manifest` build step from `tsup.config.ts` (~120 lines → ~15).
  The resources are already strings; splitting them out adds build machinery and
  changes nothing about the output.
- **No npm publish, changesets, or CI.** `npx quartz plugin add github:...` reads
  the committed `dist/`; npm is a second distribution channel nobody asked for.
- **No vitest / eslint / prettier.** One `node:assert` smoke test covers the only
  non-trivial logic.
- **No plugin options.** The plugin has none today; `optionSchema` stays empty
  until someone requests one.

Add any of these when there is a concrete reason to.

## Check

`test/smoke.mjs` — no framework, run with `node test/smoke.mjs`:

1. Build a hast tree containing an `<img src>` inside a `<p>`.
2. Run the plugin's `htmlPlugins()[0]` transform over it.
3. Assert the `<img>` was replaced by a `div.lightbox-wrapper` wrapping it, and
   that `data-src` / `class="lightbox-image"` landed on the `<img>`.
4. Assert an `<img>` with no `src` is left untouched (the early-return branch).

Runs against `dist/`, so it also proves the build output is loadable.

## Community listing

`docs/community.md` on the `v5` branch of `jackyzha0/quartz` currently has no
plugins listed. The entry is drafted into `community-entry.md` in this repo for a
manual PR; this work does not touch the Quartz repository.

## Out of scope

- Publishing to npm.
- Opening the PR against `jackyzha0/quartz`.
- Any change to the lightbox's visual behaviour.
