import { unified } from "unified"
import parse from "rehype-parse"
import { visit } from "unist-util-visit"
import { visitChildren } from "unist-util-visit-children"
import { map } from "unist-util-map"

function sanitizeHtmlString(html) {
  return html.replace(/\n/g, "").replace(/<(\/)?code>/g, "")
}

function htmlToHast(html) {
  return unified()
    .data("settings", { fragment: true })
    .use(parse, { emitParseErrors: false, duplicateAttribute: false })
    .parse(html)
}

export function getImageUrls(html) {
  const imageSources = []
  const sanitizedHtml = sanitizeHtmlString(html)
  const hast = htmlToHast(sanitizedHtml)

  map(hast, (node) => {
    if (node.tagName === "img") {
      imageSources.push(node.properties.src)
    }
  })

  return imageSources
}
