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
import { map } from "unist-util-map"
import { visit } from "unist-util-visit"

const finished = promisify(stream.finished)

const createOrUpdateImage = gql`
  mutation ($file: Upload!, $mediaTypeId: ID!) {
    createOrUpdateImage(input: { file: $file, mediaTypeId: $mediaTypeId }) {
      id
    }
  }
`

function getFileName(str) {
  return /([^/]+\.[^.]+)?$/.exec(str)[1]
}

function ellipseString(str, maxLength = 25) {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str
}

async function downloadFile({ url, targetPath }) {
  const writer = fs.createWriteStream(targetPath)
  const dataStream = await axios({ url, responseType: "stream" })
  dataStream.data.pipe(writer)
  await finished(writer)
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

export async function uploadImageFromUrl({ url, mediaTypeId, log }) {
  try {
    console.log(`Importing image${log ? ` "${log}"` : ""}...`)
    const localFilePath = path.join(config.download_folder, getFileName(url))
    await downloadFile({ url, targetPath: localFilePath })
    const { data } = await uploadImage({ filePath: localFilePath, mediaTypeId })
    const imageId = data.data.createOrUpdateImage.id
    fs.unlinkSync(localFilePath)
    console.log(`- Image found or created with id: "${imageId}"`)
    console.log("")
    return imageId
  } catch (error) {
    console.error("Upload image error", error)
  }
}

export function getImageUrls(hast) {
  const imageSources = []

  // map(hast, (node) => {
  //   if (node.tagName === "img") {
  //     imageSources.push(node.properties.src)
  //   }
  // })

  visit(hast, (node) => {
    if (node.tagName === "img") {
      imageSources.push(node.properties.src)
    }
  })

  return imageSources
}
