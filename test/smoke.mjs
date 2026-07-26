// ponytail: one assert-based check against the built output, no test framework.
// Run with `npm test` (builds first) or `node test/smoke.mjs`.
import assert from "node:assert/strict"
import * as mod from "../dist/index.js"
import { ClickableImages } from "../dist/index.js"

// Quartz's config-loader picks the `default` export and classifies the plugin by
// probing the instance. If this drifts, Quartz skips the plugin with only a warning.
assert.equal(typeof mod.default, "function")
assert.ok("htmlPlugins" in mod.default(), "must classify as a transformer")

const img = (properties) => ({ type: "element", tagName: "img", properties, children: [] })

const tree = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [img({ src: "/img/a.png", alt: "A" }), img({ alt: "no src" })],
    },
  ],
}

const transform = ClickableImages().htmlPlugins()[0]()
transform(tree, {})

const [tagged, untouched] = tree.children[0].children

// The img is tagged in place — no wrapper element, so the surrounding markup
// and any layout depending on it are left exactly as authored.
assert.equal(tagged.tagName, "img")
assert.deepEqual(tagged.properties.className, ["lightbox-image"])
assert.equal(tagged.properties.loading, "lazy")
assert.equal(tagged.properties.src, "/img/a.png", "src must be left for CrawlLinks to resolve")

// Must NOT copy src/alt: this runs before CrawlLinks resolves image paths, so a
// copy is stale and the lightbox opens a broken image. The client uses img.src.
assert.equal(tagged.properties["data-src"], undefined)
assert.equal(tagged.properties["data-alt"], undefined)

// An img without a src is left completely alone.
assert.equal(untouched.tagName, "img")
assert.equal(untouched.properties.className, undefined)
assert.equal(untouched.properties.loading, undefined)

// Resources are still shaped the way Quartz expects.
const res = ClickableImages().externalResources()
assert.equal(res.css[0].inline, true)
assert.match(res.css[0].content, /\.lightbox-image/)
assert.equal(res.js[0].contentType, "inline")
assert.equal(res.js[0].loadTime, "afterDOMReady")

// Regressions we have already paid for once, asserted so they cannot come back:
const { content: css } = res.css[0]
const { script } = res.js[0]
assert.doesNotMatch(css, /backdrop-filter\s*:/, "full-viewport blur stutters in Chrome")
assert.match(css, /dialog\.lightbox\[open\]\s*\{[^}]*display:/, "display must be set on [open] only")
assert.match(script, /__lightboxReady/, "must guard against rebinding on SPA nav")
assert.match(script, /await img\.decode\(\)/, "must decode before showModal to avoid a blank overlay")
assert.doesNotMatch(script, /addEventListener\('keydown'/, "Esc is the dialog's job, not ours")

console.log("ok — smoke tests passed")
