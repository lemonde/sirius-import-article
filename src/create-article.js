import axios from "axios"
import config from "../config"
import { visit } from "unist-util-visit"

export async function createArticle(article, blocks) {
  console.log("Importing article...")

  const { data } = await axios.post(
    config.api_endpoint,
    {
      query: `mutation CreateArticle($createArticleInput: CreateArticleInput!) {
          createArticle(input: $createArticleInput) {
            id
          }
        }`,
      variables: {
        createArticleInput: {
          layoutId: "bG9jYWw6TGF5b3V0OjE=",
          editorialTypeId: "bG9jYWw6RWRpdG9yaWFsVHlwZToyMQ==",
          sourcings: [{ sourceId: "bG9jYWw6U291cmNlOjE4" }],
          title: article.title,
          chapo: article.description,
          tagIds: [
            "bG9jYWw6VGFnOjM5MTYy",
            "bG9jYWw6VGFnOjM5MTYz",
            "bG9jYWw6VGFnOjM5MTYx",
            "bG9jYWw6VGFnOjM5MTY0",
          ],
          signatures: [{ authorId: "bG9jYWw6QXV0aG9yOjY=" }],
          blocks,
        },
      },
    },
    { headers: { Authorization: `Bearer ${config.bearer_token}` } }
  )

  console.log(`- Article created with id: "${data.data.createArticle.id}"`)

  return createdArticle
}

function createTextBLock(html) {
  return {
    type: "text",
    textBlock: { textType: "paragraph", html },
  }
}

function createImageBLock(imageId) {
  return {
    type: "image",
    imageBlock: { imageView: { imageId } },
  }
}

function getContainerBlocks({ node, imageIds, usedImages }) {
  let blocks = []
  let pendingText = ""
  let usedImagesIndex = usedImages

  node.children.forEach((child) => {
    const {
      usedImages,
      text,
      blocks: nodeBlocks = [],
    } = parseNode(child, imageIds, usedImagesIndex)

    const nodeBlocksList = Array.isArray(nodeBlocks) ? nodeBlocks : [nodeBlocks]

    if (nodeBlocksList.length) {
      if (pendingText !== "") blocks.push(createTextBLock(text))
      blocks.push(...nodeBlocksList)
    } else {
      pendingText += text
    }

    usedImagesIndex = usedImages
  })

  if (pendingText) blocks.push(createTextBLock(pendingText))
  return { blocks, usedImages: usedImagesIndex }
}

function parseNode(node, imageIds, usedImages = 0) {
  const nodeType = node?.tagName || node.type

  switch (nodeType) {
    case "p":
      const containerBlocks = getContainerBlocks({ node, imageIds, usedImages })
      return containerBlocks

    case "text":
      return { text: node.value, usedImages }

    case "a":
      if (node.children.length !== 1) {
        return getContainerBlocks({ node, imageIds, usedImages })
      }

      const child = node.children[0]
      if (child.type !== "text") {
        return parseNode(child, imageIds, usedImages)
      }

      return {
        text: `<a href="${node.properties.href}">${child.value}</a>`,
        usedImages,
      }

    case "img":
      return {
        blocks: createImageBLock(imageIds[usedImages]),
        usedImages: usedImages + 1,
      }

    default:
      throw new Error(`Unknow balise: "${node.tagName}"`)
  }
}

export function getArticleBlocks({ hast, imageIds }) {
  const articleBlocks = []

  visit(hast, "element", (node) => {
    if (node.tagName !== "p") return
    const { blocks } = parseNode(node, imageIds)
    articleBlocks.push(...blocks)
  })

  return articleBlocks
}
