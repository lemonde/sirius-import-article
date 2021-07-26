const fs = require("fs")
const axios = require("axios")
const { promisify } = require("util")
const stream = require("stream")
const finished = promisify(stream.finished)
const path = require("path")

function getMimeType(str) {
  const fileExtention = /(?:\.([^.]+))?$/.exec(str)[1]

  switch (fileExtention.trim()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg"
    case "png":
      return "image/png"
    default:
      throw new Error(`Unknowed extention type: "${extention}".`)
  }
}

async function downloadFile(url, filePath) {
  const writer = fs.createWriteStream(filePath)

  try {
    const dataStream = await axios({ url, responseType: "stream" })
    dataStream.data.pipe(writer)
    await finished(writer)
  } catch (error) {
    console.error("Download error", error)
  }
}

exports.downloadFile = downloadFile