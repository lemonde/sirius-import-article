/* eslint-disable no-console */
import fs from "fs"
import path from "path"
import axios from "axios"
import { promisify } from "util"
import stream from "stream"
import { print } from "graphql"
import gql from "graphql-tag"
import FormData from "form-data"
import config from "../config"

const finished = promisify(stream.finished)

const createOrUpdateImage = gql`
  mutation ($file: Upload!, $mediaTypeId: ID!) {
    createOrUpdateImage(input: { file: $file, mediaTypeId: $mediaTypeId }) {
      id
    }
  }
`

function getFileNameFromUrl(str) {
  return /([^/]+\.[^.]+)?$/.exec(str)[1]
}

function ellipseString(str, maxLength = 25) {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str
}

async function downloadFile({ url, targetPath }) {
  const writer = fs.createWriteStream(targetPath)

  try {
    const dataStream = await axios({ url, responseType: "stream" })
    dataStream.data.pipe(writer)
    await finished(writer)
  } catch (error) {
    console.error("Download error", error)
  }
}

async function uploadImage({ filePath, mediaTypeId }) {
  const form = new FormData()
  form.append(
    "operations",
    JSON.stringify({
      query: print(createOrUpdateImage),
      variables: { mediaTypeId, file: null },
    })
  )
  form.append("map", JSON.stringify({ 1: ["variables.file"] }))
  form.append("1", fs.createReadStream(filePath))

  return axios.post(config.api_endpoint, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${config.bearer_token}`,
    },
  })
}

export async function uploadImageFromUrl({ url, mediaTypeId }) {
  try {
    console.log(`- Importing image in Sirius from: "${ellipseString(url)}"`)

    const localFilePath = path.join(
      config.download_folder,
      getFileNameFromUrl(url)
    )

    await downloadFile({ url, targetPath: localFilePath })

    const {
      data: {
        data: {
          createOrUpdateImage: { id: imageId },
        },
      },
    } = await uploadImage({ filePath: localFilePath, mediaTypeId })

    fs.unlinkSync(localFilePath)
    console.log(
      `- Success, image found or created in Sirius with id: "${imageId}"`
    )
    console.log("")
    return imageId
  } catch (error) {
    if (error.response?.data?.errors?.length) {
      console.log(JSON.stringify(error.response.data.errors, null, 2))
    } else {
      console.error("Upload image error", error)
    }
  }
}
