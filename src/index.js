const fs = require("fs")
const config = config("./config")
const { downloadFile, getMimeType } = require("./utils")
const { print } = require("graphql")
const gql = require("graphql-tag")
const axios = require("axios")
const article = require("./article")

const createOrUpdateImage = gql`
  mutation ($input: CreateOrUpdateImageInput!) {
    createOrUpdateImage(input: $input) {
      id
    }
  }
`

async function uploadImage({ url, mediaTypeId }) {
  try {
    const imageName = getImageName(url)
    const filePath = path.join(config.DOWNLOAD_FOLDER, imageName)
    const mimetype = getMimeType(filePath)

    console.log("filePath", filePath)
    // await downloadFile(url, filePath)

    const file = fs.createReadStream(filePath)
    console.log(Object.keys(file))

    const { data } = await axios.post(
      config.API_ENDPOINT,
      {
        query: print(createOrUpdateImage),
        variables: {
          input: {
            file: (async () => ({
              createReadStream: () => file,
              stream: file,
              filename: imageName,
              mimetype,
            }))(),
            mediaTypeId,
          },
        },
      },
      { headers: { Authorization: `Bearer ${config.BEARER_TOKEN}` } }
    )

    console.log(data)

    // fs.unlinkSync(filePath)
  } catch (error) {
    console.error("Upload image error", error)
  }
}

async function main() {
  await uploadImage({
    url: article.cover_image,

    // Photo media type id
    mediaTypeId: "bG9jYWw6TWVkaWE6Mg==",
  })
}

main()
