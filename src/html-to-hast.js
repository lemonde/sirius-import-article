import { unified } from "unified"
import parse from "rehype-parse"

function sanitizeHtmlString(html) {
  return html.replace(/\n/g, "").replace(/<(\/)?code>/g, "")
}

export function htmlToHast(html) {
  return unified()
    .data("settings", { fragment: true })
    .use(parse, { emitParseErrors: false, duplicateAttribute: false })
    .parse(sanitizeHtmlString(html))
}
