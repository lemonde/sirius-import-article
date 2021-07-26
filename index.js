const fs = require("fs")
const path = require("path")
const { downloadFile } = require("./utils")
const { print } = require("graphql")
const gql = require("graphql-tag")
const axios = require("axios")
const FormData = require("form-data")
const article = require("./article")

const API_ENDPOINT = "https://local.sirius.press/api/public/graphql"
const BEARER_TOKEN = "8hwqbym1bc9ywcygh55ddywb1sc6rwye4bfuknjq"
const PHOTO_MEDIA_TYPE_ID = "bG9jYWw6TWVkaWE6Mg=="
const DOWNLOAD_FOLDER = path.join(__dirname, "./downloads/")

const createOrUpdateImage = gql`
  mutation ($file: Upload!, $mediaTypeId: ID!) {
    createOrUpdateImage(input: { file: $file, mediaTypeId: $mediaTypeId }) {
      id
    }
  }
`

function getNameFromUrl(str) {
  const imageName 
}

async function uploadImage() {
  const form = new FormData()
  form.append(
    "operations",
    JSON.stringify({
      query: print(createOrUpdateImage),
      variables: { mediaTypeId: PHOTO_MEDIA_TYPE_ID, file: null },
    })
  )
  form.append("map", JSON.stringify({ 1: ["variables.file"] }))
  form.append("1", fs.createReadStream(filePath))

  await axios.post(API_ENDPOINT, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${BEARER_TOKEN}`,
    },
  })
}

async function uploadImageFromUrl(url) {
  try {
    const localImagePath = path.join(DOWNLOAD_FOLDER, getNameFromUrl(url))

    await downloadFile({ url, localImagePath })
    console.log("Image downloaded")

    await uploadImageFromUrl()
    console.log("Image sent to Sirius")

    fs.unlinkSync(localImagePath)
    console.log("Local copy deleted")
  } catch (error) {
    if (error.response?.data?.errors?.length) {
      console.log(JSON.stringify(error.response.data.errors, null, 2))
    } else {
      console.error("Upload image error", error)
    }
  }
}

async function main() {
  await uploadImageFromUrl({
    url: article.cover_image,
    mediaTypeId: PHOTO_MEDIA_TYPE_ID,
  })
}

main()
