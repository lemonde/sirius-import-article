import path from "path"

const __dirname = path.resolve()

const config = {
  api_endpoint: "https://local.sirius.press/api/public/graphql",
  bearer_token: "psuhi2neld9l91qpswutb1v8utyevtaaizma2yxt",
  download_folder: path.join(__dirname, "./downloads/"),
}

export default config
