import path from "path"

const __dirname = path.resolve()

const config = {
  api_endpoint: "https://local.sirius.press/api/public/graphql",
  bearer_token: "8hwqbym1bc9ywcygh55ddywb1sc6rwye4bfuknjq",
  download_folder: path.join(__dirname, "./downloads/"),
}

export default config
