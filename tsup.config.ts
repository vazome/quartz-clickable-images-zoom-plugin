import { defineConfig } from "tsup"

// Packages that must be a single shared instance across Quartz and all plugins.
// Everything else is bundled so users install nothing.
const SINGLETON_EXTERNALS = [
  "preact",
  "preact/hooks",
  "preact/jsx-runtime",
  "preact/compat",
  "@jackyzha0/quartz",
  "@jackyzha0/quartz/*",
  "vfile",
  "vfile/*",
  "unified",
]

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: false,
  target: "es2022",
  platform: "node",
  outDir: "dist",
  noExternal: [/.*/],
  external: SINGLETON_EXTERNALS,
})
