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

const [wrapped, untouched] = tree.children[0].children

// the img with a src is wrapped
assert.equal(wrapped.tagName, "div")
assert.deepEqual(wrapped.properties.className, ["lightbox-wrapper"])
assert.equal(wrapped.properties["data-lightbox"], "true")
assert.equal(wrapped.children.length, 1)

const inner = wrapped.children[0]
assert.equal(inner.tagName, "img")
assert.deepEqual(inner.properties.className, ["lightbox-image"])
assert.equal(inner.properties["data-src"], "/img/a.png")
assert.equal(inner.properties["data-alt"], "A")
assert.equal(inner.properties.loading, "lazy")

// the img without a src is left alone
assert.equal(untouched.tagName, "img")
assert.equal(untouched.properties.className, undefined)
assert.equal(untouched.properties["data-src"], undefined)

// resources are still shaped the way Quartz expects
const res = ClickableImages().externalResources()
assert.equal(res.css[0].inline, true)
assert.match(res.css[0].content, /\.lightbox-wrapper/)
assert.equal(res.js[0].contentType, "inline")
assert.equal(res.js[0].loadTime, "afterDOMReady")
assert.match(res.js[0].script, /addEventListener\('nav', initLightbox\)/)

console.log("ok — smoke tests passed")
