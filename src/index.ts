import type { QuartzTransformerPlugin } from "@quartz-community/types"
import type { Root } from "hast"
import { visit } from "unist-util-visit"

export const ClickableImages: QuartzTransformerPlugin = () => {
  return {
    name: "ClickableImages",
    htmlPlugins() {
      return [
        () => {
          return (tree: Root, _file: unknown) => {
            visit(tree, "element", (node: any) => {
              if (node.tagName !== "img" || !node.properties?.src) return

              // Tag the image and nothing else. Deliberately no data-src copy of
              // the path: this transformer runs before CrawlLinks resolves image
              // paths, so any copy taken here is stale. The client reads img.src,
              // which the browser has already resolved to an absolute URL.
              node.properties.className = (node.properties.className || []).concat([
                "lightbox-image",
              ])
              node.properties.loading = "lazy"
            })
          }
        },
      ]
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

/* Only ever set display on [open] — styling display on the dialog itself
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
  /* Sized entirely by CSS — no JS measurement, so nothing resizes after paint. */
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
            `,
          },
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
            `,
          },
        ],
      }
    },
  }
}

export default ClickableImages
