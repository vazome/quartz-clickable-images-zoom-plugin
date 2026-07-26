// node_modules/unist-util-is/lib/index.js
var convert = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  (function(test) {
    if (test === null || test === void 0) {
      return ok;
    }
    if (typeof test === "function") {
      return castFactory(test);
    }
    if (typeof test === "object") {
      return Array.isArray(test) ? anyFactory(test) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        propertiesFactory(
          /** @type {Props} */
          test
        )
      );
    }
    if (typeof test === "string") {
      return typeFactory(test);
    }
    throw new Error("Expected function, string, or object as test");
  })
);
function anyFactory(tests) {
  const checks = [];
  let index = -1;
  while (++index < tests.length) {
    checks[index] = convert(tests[index]);
  }
  return castFactory(any);
  function any(...parameters) {
    let index2 = -1;
    while (++index2 < checks.length) {
      if (checks[index2].apply(this, parameters)) return true;
    }
    return false;
  }
}
function propertiesFactory(check) {
  const checkAsRecord = (
    /** @type {Record<string, unknown>} */
    check
  );
  return castFactory(all);
  function all(node) {
    const nodeAsRecord = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      node
    );
    let key;
    for (key in check) {
      if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
    }
    return true;
  }
}
function typeFactory(check) {
  return castFactory(type);
  function type(node) {
    return node && node.type === check;
  }
}
function castFactory(testFunction) {
  return check;
  function check(value, index, parent) {
    return Boolean(
      looksLikeANode(value) && testFunction.call(
        this,
        value,
        typeof index === "number" ? index : void 0,
        parent || void 0
      )
    );
  }
}
function ok() {
  return true;
}
function looksLikeANode(value) {
  return value !== null && typeof value === "object" && "type" in value;
}

// node_modules/unist-util-visit-parents/lib/color.node.js
function color(d) {
  return "\x1B[33m" + d + "\x1B[39m";
}

// node_modules/unist-util-visit-parents/lib/index.js
var empty = [];
var CONTINUE = true;
var EXIT = false;
var SKIP = "skip";
function visitParents(tree, test, visitor, reverse) {
  let check;
  if (typeof test === "function" && typeof visitor !== "function") {
    reverse = visitor;
    visitor = test;
  } else {
    check = test;
  }
  const is2 = convert(check);
  const step = reverse ? -1 : 1;
  factory(tree, void 0, [])();
  function factory(node, index, parents) {
    const value = (
      /** @type {Record<string, unknown>} */
      node && typeof node === "object" ? node : {}
    );
    if (typeof value.type === "string") {
      const name = (
        // `hast`
        typeof value.tagName === "string" ? value.tagName : (
          // `xast`
          typeof value.name === "string" ? value.name : void 0
        )
      );
      Object.defineProperty(visit2, "name", {
        value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")"
      });
    }
    return visit2;
    function visit2() {
      let result = empty;
      let subresult;
      let offset;
      let grandparents;
      if (!test || is2(node, index, parents[parents.length - 1] || void 0)) {
        result = toResult(visitor(node, parents));
        if (result[0] === EXIT) {
          return result;
        }
      }
      if ("children" in node && node.children) {
        const nodeAsParent = (
          /** @type {UnistParent} */
          node
        );
        if (nodeAsParent.children && result[0] !== SKIP) {
          offset = (reverse ? nodeAsParent.children.length : -1) + step;
          grandparents = parents.concat(nodeAsParent);
          while (offset > -1 && offset < nodeAsParent.children.length) {
            const child = nodeAsParent.children[offset];
            subresult = factory(child, offset, grandparents)();
            if (subresult[0] === EXIT) {
              return subresult;
            }
            offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
          }
        }
      }
      return result;
    }
  }
}
function toResult(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "number") {
    return [CONTINUE, value];
  }
  return value === null || value === void 0 ? empty : [value];
}

// node_modules/unist-util-visit/lib/index.js
function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
  let reverse;
  let test;
  let visitor;
  {
    test = testOrVisitor;
    visitor = visitorOrReverse;
    reverse = maybeReverse;
  }
  visitParents(tree, test, overload, reverse);
  function overload(node, parents) {
    const parent = parents[parents.length - 1];
    const index = parent ? parent.children.indexOf(node) : void 0;
    return visitor(node, index, parent);
  }
}

// src/index.ts
var ClickableImages = () => {
  return {
    name: "ClickableImages",
    htmlPlugins() {
      return [
        () => {
          return (tree, _file) => {
            visit(tree, "element", (node) => {
              if (node.tagName !== "img" || !node.properties?.src) return;
              node.properties.className = (node.properties.className || []).concat([
                "lightbox-image"
              ]);
              node.properties.loading = "lazy";
            });
          };
        }
      ];
    },
    externalResources() {
      return {
        css: [
          {
            inline: true,
            content: `
.lightbox-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
  transition: box-shadow 0.2s ease;
}

.lightbox-image:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* A native <dialog> gives us Esc-to-close, focus trapping, inert background
   and the ::backdrop pseudo-element, so none of that needs scripting. */
dialog.lightbox {
  padding: 0;
  border: 0;
  background: none;
  max-width: none;
  max-height: none;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Only ever set display on [open] \u2014 styling display on the dialog itself
   would override the UA's display:none and leave it permanently visible. */
dialog.lightbox[open] {
  display: grid;
  place-items: center;
}

dialog.lightbox::backdrop {
  /* ponytail: flat colour, no backdrop-filter. A full-viewport blur is
     recomposited every frame in Chrome and is what made this stutter. */
  background: rgba(0, 0, 0, 0.9);
}

/* Fade in on the compositor only. @starting-style supplies the "from" state,
   so there is no layout or paint work in the animation at all. */
dialog.lightbox,
dialog.lightbox::backdrop {
  transition: opacity 0.2s ease;
  opacity: 1;
}

@starting-style {
  dialog.lightbox[open],
  dialog.lightbox[open]::backdrop {
    opacity: 0;
  }
}

dialog.lightbox img {
  /* Sized entirely by CSS \u2014 no JS measurement, so nothing resizes after paint. */
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  cursor: zoom-out;
}

.lightbox-close {
  position: fixed;
  top: 20px;
  right: 30px;
  font-size: 2rem;
  line-height: 1;
  color: white;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.lightbox-close:hover {
  background: rgba(0, 0, 0, 0.8);
}

@media (max-width: 768px) {
  .lightbox-close {
    top: 10px;
    right: 15px;
    font-size: 1.5rem;
    width: 35px;
    height: 35px;
  }
}

@media (prefers-reduced-motion: reduce) {
  dialog.lightbox,
  dialog.lightbox::backdrop {
    transition: none;
  }
}
            `
          }
        ],
        js: [
          {
            loadTime: "afterDOMReady",
            contentType: "inline",
            script: `
              // Guard against re-execution: Quartz may run this again on SPA
              // navigation, and re-binding would leak a handler per page view.
              if (!window.__lightboxReady) {
                window.__lightboxReady = true;

                let dialog;
                function getDialog() {
                  if (dialog) return dialog;
                  dialog = document.createElement('dialog');
                  dialog.className = 'lightbox';
                  const close = document.createElement('button');
                  close.className = 'lightbox-close';
                  close.setAttribute('aria-label', 'Close lightbox');
                  close.innerHTML = '&times;';
                  const img = document.createElement('img');
                  img.alt = '';
                  dialog.append(close, img);
                  document.body.appendChild(dialog);

                  dialog.addEventListener('click', (e) => {
                    // Backdrop clicks land on the dialog itself; the image and
                    // the close button both also dismiss.
                    if (e.target === dialog || e.target === img || e.target === close) {
                      dialog.close();
                    }
                  });
                  dialog.addEventListener('close', () => {
                    document.documentElement.style.overflow = '';
                  });
                  return dialog;
                }

                // One delegated listener on the document. It survives SPA
                // navigation untouched, so there is nothing to rebind or clean up.
                document.addEventListener('click', async (e) => {
                  const thumb = e.target && e.target.closest
                    ? e.target.closest('img.lightbox-image')
                    : null;
                  if (!thumb) return;

                  const d = getDialog();
                  const img = d.querySelector('img');
                  // currentSrc is the exact URL the browser already fetched, so
                  // this is a cache hit rather than a second download.
                  img.src = thumb.currentSrc || thumb.src;
                  img.alt = thumb.alt || '';

                  // Decode before opening. This is what removes the dark
                  // rectangle that used to sit there while the JPEG decoded.
                  try {
                    await img.decode();
                  } catch (err) {
                    /* decode() rejects if src changed mid-flight; showing anyway is fine */
                  }

                  document.documentElement.style.overflow = 'hidden';
                  d.showModal();
                });
              }
            `
          }
        ]
      };
    }
  };
};
var src_default = ClickableImages;

export { ClickableImages, src_default as default };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map