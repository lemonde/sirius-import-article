/* eslint-disable no-console */
import article from "./fixtures/article" assert { type: "json" }
import { uploadImageFromUrl, getImageUrls } from "./import-image"
import { createArticle, getArticleBlocks } from "./create-article"
import { htmlToHast } from "./html-to-hast"

const ILLUSTRATION_MEDIA_TYPE_ID = "bG9jYWw6TWVkaWE6Mw==_"
const PHOTO_MEDIA_TYPE_ID = "bG9jYWw6TWVkaWE6Mg=="

async function importContentImages(hast) {
  const contentImageUrls = getImageUrls(hast)
  return Promise.all(
    contentImageUrls.map(async (url, index) =>
      uploadImageFromUrl({
        log: `article content ${index + 1}`,
        url,
        mediaTypeId: PHOTO_MEDIA_TYPE_ID,
      })
    )
  )
}

async function main() {
  try {
    await uploadImageFromUrl({
      log: "cover",
      url: article.cover_image,
      // "Illustration" media type id
      mediaTypeId: ILLUSTRATION_MEDIA_TYPE_ID,
    })

    await uploadImageFromUrl({
      log: "user profile",
      url: article.user.profile_image_90,
      // "Photo" media type id
      mediaTypeId: PHOTO_MEDIA_TYPE_ID,
    })

    const hast = htmlToHast(article.body_html)
    const imageIds = await importContentImages(hast)
    const blocks = getArticleBlocks({ hast, imageIds })
    await createArticle(article, blocks)
  } catch (error) {
    console.error("Article creation error", error)
  }
}

main()
