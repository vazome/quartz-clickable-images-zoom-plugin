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
            visit(tree, "element", (node, index, parent) => {
              if (node.tagName === "img" && parent && index !== void 0) {
                const originalSrc = node.properties?.src;
                const originalAlt = node.properties?.alt || "";
                if (!originalSrc) return;
                node.properties.className = (node.properties.className || []).concat([
                  "lightbox-image"
                ]);
                node.properties["data-src"] = originalSrc;
                node.properties["data-alt"] = originalAlt;
                node.properties.loading = "lazy";
                const wrapper = {
                  type: "element",
                  tagName: "div",
                  properties: {
                    className: ["lightbox-wrapper"],
                    "data-lightbox": "true"
                  },
                  children: [node]
                };
                parent.children[index] = wrapper;
              }
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
/* Lightbox Image Styles */
.lightbox-wrapper {
  display: inline-block;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin: 0;
}

.lightbox-wrapper:hover {
  transform: scale(1.02);
}

.lightbox-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.lightbox-image:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Modal/Lightbox Overlay */
.lightbox-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  backdrop-filter: blur(5px);
}

.lightbox-modal.active {
  opacity: 1;
  visibility: visible;
}

.lightbox-modal img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.lightbox-modal.active img {
  transform: scale(1);
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 30px;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  z-index: 1001;
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

/* Prevent body scroll when modal is open */
body.lightbox-open {
  overflow: hidden;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .lightbox-modal img {
    max-width: 95%;
    max-height: 95%;
  }

  .lightbox-close {
    top: 10px;
    right: 15px;
    font-size: 1.5rem;
    width: 35px;
    height: 35px;
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
              // Lightbox functionality
              function initLightbox() {
                // Remove existing modal if it exists
                const existingModal = document.querySelector('.lightbox-modal');
                if (existingModal) {
                  existingModal.remove();
                }

                // Create modal elements
                const modal = document.createElement('div');
                modal.className = 'lightbox-modal';

                const closeBtn = document.createElement('button');
                closeBtn.className = 'lightbox-close';
                closeBtn.innerHTML = '\xD7';
                closeBtn.setAttribute('aria-label', 'Close lightbox');

                const img = document.createElement('img');
                img.style.display = 'none';

                modal.appendChild(closeBtn);
                modal.appendChild(img);
                document.body.appendChild(modal);

                // Function to open lightbox
                function openLightbox(imageSrc, imageAlt, originalImg) {
                  img.src = imageSrc;
                  img.alt = imageAlt || '';
                  img.style.display = 'block';
                  modal.classList.add('active');
                  document.body.classList.add('lightbox-open');

                  // Preload the image and set appropriate size
                  const preloadImg = new Image();
                  preloadImg.onload = () => {
                    img.src = imageSrc;

                    // Get original image size on page
                    const originalRect = originalImg ? originalImg.getBoundingClientRect() : null;
                    const originalDisplayWidth = originalRect ? originalRect.width : 0;
                    const originalDisplayHeight = originalRect ? originalRect.height : 0;

                    // Smart scaling based on image size
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const imageWidth = preloadImg.naturalWidth;
                    const imageHeight = preloadImg.naturalHeight;

                    // Calculate appropriate display size
                    let targetWidth, targetHeight;

                    // Ensure lightbox image is at least 1.5x the size it appears on page
                    const minDisplayWidth = Math.max(
                      originalDisplayWidth * 1.5,
                      Math.min(500, viewportWidth * 0.7)
                    );
                    const minDisplayHeight = Math.max(
                      originalDisplayHeight * 1.5,
                      Math.min(400, viewportHeight * 0.7)
                    );

                    // Calculate scale to meet minimum size requirements
                    const scaleForWidth = minDisplayWidth / imageWidth;
                    const scaleForHeight = minDisplayHeight / imageHeight;
                    const minScale = Math.max(scaleForWidth, scaleForHeight, 1); // At least 1x (never smaller than original)

                    // Limit maximum scale to prevent pixelation
                    const maxScale = Math.min(3, viewportWidth * 0.9 / imageWidth, viewportHeight * 0.9 / imageHeight);
                    const finalScale = Math.min(minScale, maxScale);

                    targetWidth = Math.min(imageWidth * finalScale, viewportWidth * 0.9);
                    targetHeight = Math.min(imageHeight * finalScale, viewportHeight * 0.9);
                    img.style.width = targetWidth + 'px';
                    img.style.height = 'auto';
                  };
                  preloadImg.src = imageSrc;
                }

                // Function to close lightbox
                function closeLightbox() {
                  modal.classList.remove('active');
                  document.body.classList.remove('lightbox-open');
                  setTimeout(() => {
                    img.style.display = 'none';
                    img.src = '';
                  }, 300);
                }

                // Event listeners
                closeBtn.addEventListener('click', closeLightbox);

                modal.addEventListener('click', (e) => {
                  if (e.target === modal) {
                    closeLightbox();
                  }
                });

                // Keyboard support
                document.addEventListener('keydown', (e) => {
                  if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeLightbox();
                  }
                });

                // Add click handlers to all lightbox images
                const lightboxWrappers = document.querySelectorAll('.lightbox-wrapper');
                lightboxWrappers.forEach(wrapper => {
                  wrapper.addEventListener('click', (e) => {
                    e.preventDefault();
                    const img = wrapper.querySelector('.lightbox-image');
                    if (img) {
                      const src = img.getAttribute('data-src') || img.src;
                      const alt = img.getAttribute('data-alt') || img.alt;
                      openLightbox(src, alt, img);
                    }
                  });
                });

                // Clean up function
                if (window.addCleanup) {
                  window.addCleanup(() => {
                    if (modal && modal.parentNode) {
                      modal.parentNode.removeChild(modal);
                    }
                    document.body.classList.remove('lightbox-open');
                  });
                }
              }

              // Initialize on page load and navigation
              document.addEventListener('nav', initLightbox);

              // Initialize immediately if DOM is already ready
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initLightbox);
              } else {
                initLightbox();
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