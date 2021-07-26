/* eslint-disable no-console */
import { uploadImageFromUrl } from "./image-upload"
import article from "./fixtures/article"
import { getImageUrls } from "./get-image-urls"

async function main() {
  try {
    console.log("1. Import cover image")
    await uploadImageFromUrl({
      url: article.cover_image,
      mediaTypeId: "bG9jYWw6TWVkaWE6Mw==_", // "Illustration" media type id
    })

    console.log("2. Import user profile image")
    await uploadImageFromUrl({
      url: article.user.profile_image_90,
      mediaTypeId: "bG9jYWw6TWVkaWE6Mg==", // "Photo" media type id
    })

    console.log("3. Import artice content images")
    await Promise.all(
      getImageUrls(article.body_html).map(async (url) =>
        uploadImageFromUrl({ url, mediaTypeId: "bG9jYWw6TWVkaWE6Mg==" })
      )
    )
  } catch (error) {
    if (error.response?.data?.errors?.length) {
      console.log(JSON.stringify(error.response.data.errors, null, 2))
    } else {
      console.error("Upload image error", error)
    }
  }
}

main()
