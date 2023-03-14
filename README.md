# Sirius import article

Step-by-step tutorial on how to import an article into Sirius app with the GraphQL API

## Summary

- [Playground](#playground)
- [Source article](#source-article)
- [Data correspondence](#data-correspondence)
- [Required data](#required-data)
  - [Get the "Article" layout id](#get-the-factuel-editorial-type-id)
  - [Get the "Factuel" editorial type id](#get-the-factuel-editorial-type-id)
- [Linked resources](#linked-resources)
  - [Source creation](#source-creation)
  - [Tags creation](#tags-creation)
  - [Author creation](#author-creation)
  - [Images import](#images-import)
- [Article creation](#article-creation)

## Playground

GraphQL queries and mutations will be execute in Sirius GraphQL playground:
```
https://*.sirius.press/api/public/graphql
```

> It requires to be logged in with a Sirius account that have `admin:access:prod` permission.

## Source article

In this tutorial, we will import [this article](https://dev.to/dhanushxeno/react-souce-code-visible-4e57) from [DEV.to API](https://docs.forem.com/api).

We curl the API and store the result in [article.json](article.json) file.

```shell
curl https://dev.to/api/articles/768225 > article.json
```

## Data correspondence

Correspondence between article data and Sirius fields.

| User data     | Sirius author fields |
|---------------|----------------------|
| name          | name                 |
| profile_image | avatarId             |

> Tip: If you would like to add some extra fields (e.g. `twitter_username`), you are able to create a custom field for authors from Sirius Admin dashboard.

| Image data  | Sirius image fields |
|-------------|---------------------|
| cover_image | file or url         |

| Article data | Sirius article fields |
|--------------|-----------------------|
| title        | title                 |
| description  | chapo                 |
| tags         | tagIds                |
| body_html    | blocks                |
| user         | signatures            |
| url          | slug                  |
| published_at | firstPublishedAt      |
| social_image | featureImage          |

Some data from DEV.to API can't be imported in Sirius API.

<details>
<summary>Show ignored article data list</summary>

| Ignored article data |                          |                        |               |
|----------------------|--------------------------|------------------------|---------------|
| type_of              | id                       | readable_publish_date  | slug          |
| path                 | comments_count           | public_reactions_count | collection_id |
| published_timestamp  | positive_reactions_count | last_comment_at        | canonical_url |
| reading_time_minutes | tag_list                 | body_markdown          | url           |
| created_at           | edited_at                | crossposted_at         |               |

| Ignored user data |          |                 |             |
|-------------------|----------|-----------------|-------------|
| twitter_username  | username | github_username | website_url |
| profile_image_90  |          |                 |             |

| Ignored flare_tag data |              |                |
|------------------------|--------------|----------------|
| name                   | bg_color_hex | text_color_hex |

</details>

## Required data

To create an `article` on Sirius API we use the `createArticle` mutation with a `createArticleInput` param. (browse "Docs" on your graphql playground)

The minimal required fields to create an article are article layout id (`layoutId`) and editorial type id (`editorialTypeId`).

### Get the "Article" layout id

Execute this `articleLayouts` query in the [Playground](#playground) to get "Article" layout id.

Here we search the "article" layout

```graphql
query Layout {
  articleLayout(key: "article") {
    id
    name
  }
}
```

The return is :

```json
{
  "data": {
    "articleLayout": {
      "id": "bG9jYWw6TGF5b3V0OjE",
      "name": "Article"
    }
  }
}
```

The "article" `layoutId` : `bG9jYWw6TGF5b3V0OjE`


### Get the "Factuel" editorial type id

There is an editorial types admin page where we can find the "Factuel" id.

- Go to editorial types admin page : `/cms-client/admin/article/editorial-types`
- Click on "Factuel".
- At the bottom-end of page, copy the [Global ID](https://developer.sirius.press/docs/guides/global-id/). This global id is the research `editorialTypeId`

![Edition type id](./src/images/edition-type-global-id.png)

The `editorialTypeId` is : `bG9jYWw6RWRpdG9yaWFsVHlwZToyMQ`

> we could have use the `editorialType` query to retrieve the same id.

## Linked resources

### Source creation

We use `createSource` mutation to create "dev.to" source.

```graphql
mutation CreateSource {
  createSource(input: { key: "dev_to", name: "dev.to" }) {
    id
  }
}
```

The `sourceId` is: `bG9jYWw6U291cmNlOjIx`

### Tags creation

Execute `createRubric` mutations to create the Tags :

```graphql
mutation CreateRubric {
  createRubric(input: { key: "javascript", name: "javascript", main: true }) {
    id
    name
  }
}
```

for each tags, for this exemple: "react", "showdev", "discuss"

The tags ids are :

- "javascript": `bG9jYWw6VGFnOjM5MTYy`
- "react": `bG9jYWw6VGFnOjM5MTYz`
- "showdev": `bG9jYWw6VGFnOjM5MTYx`
- "discuss": `bG9jYWw6VGFnOjM5MTY0`

### Author creation

Execute the `createAuthor` mutation to create new author named "DHANUSH N".

```graphql
mutation CreateAuthor {
  createAuthor(input: { name: "DHANUSH N" }) {
    id
    name
  }
}
```

The return `authorId` is: `bG9jYWw6QXV0aG9yOjQ`

### Images import

The cover image is an "illustration". Execute the following query to find "illustration" `mediaTypeId`

```graphql
query MediaType {
  mediaType(key: "illustration") {
    id
    name
  }
}
```

The `mediaTypeId` are :

- "Illustration": `bG9jYWw6TWVkaWE6Mw`
- "Photo": `bG9jYWw6TWVkaWE6Mg`

ps. It could have been found in the media admin page : `/admin/medias`

We now need to import all images :

```javascript
// src/index.js
import { uploadImageFromUrl } from "./src/image-upload"
import article from "./src/fixtures/article" assert { type: "json" }
import { getImageUrls } from "./src/get-image-urls"

const ILLUSTRATION_MEDIA_TYPE_ID = "bG9jYWw6TWVkaWE6Mw"
const PHOTO_MEDIA_TYPE_ID = "bG9jYWw6TWVkaWE6Mg"

async function importImages() {
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
  } catch (error) {
    if (error.response?.data?.errors?.length) {
      console.log(JSON.stringify(error.response.data.errors, null, 2))
    } else {
      console.error("Upload image error", error)
    }
  }
}
```

You can also use `createOrUpdateImageFromUrl` mutation instead of `createOrUpdateImage` to upload images by its URL :

```graphql
mutation {
  createOrUpdateImageFromUrl(
    input: {
      url: "https://res.cloudinary.com/practicaldev/image/fetch/s--vvaIehy5--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/3fg8ztmywdcuossl75ch.png"
      mediaTypeId: "bG9jYWw6TWVkaWE6Mw"
      #...
    }
  ) {
    id
  }
}
```

### HTML parsing

In the previous article, we use the `htmlToHast()` to parse the article HTML body. In this parsing we use "unified" and "rehype-parse" libraries. Implementation details are in the [html-to-hast](src/html-to-hast.js) file.

```javascript
// src/html-to-hast.js
import { unified } from "unified"
import parse from "rehype-parse"

function sanitizeHtmlString(html) {
  return html.replace(/\n/g, "").replace(/<(\/)?code>/g, "")
}

export function htmlToHast(html) {
  return unified()
    .data("settings", { fragment: true })
    .use(parse, { emitParseErrors: false, duplicateAttribute: false })
    .parse(sanitizeHtmlString(html))
}
```

#### Article blocks

We transform the article content ("article.body_html") in Sirius `BlockInput`:

```javascript
// src/create-article.js
const articleBlocks = []

visit(hast, "element", (node) => {
  if (node.tagName !== "p") return
  const { blocks } = parseNode(node, imageIds)
  articleBlocks.push(...blocks)
})

return articleBlocks
```

We execute the `ArticleCreation` mutation with the article data:

```javascript
// src/create-article.js
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
          layoutId: "bG9jYWw6TGF5b3V0OjE",
          editorialTypeId: "bG9jYWw6RWRpdG9yaWFsVHlwZToyMQ",
          sourcings: [{ sourceId: "bG9jYWw6U291cmNlOjIx" }],
          title: article.title,
          chapo: article.description,
          tagIds: [
            "bG9jYWw6VGFnOjM5MTYy",
            "bG9jYWw6VGFnOjM5MTYz",
            "bG9jYWw6VGFnOjM5MTYx",
            "bG9jYWw6VGFnOjM5MTY0",
          ],
          signatures: [{ authorId: "bG9jYWw6QXV0aG9yOjQ" }],
          blocks,
        },
      },
    },
    { headers: { Authorization: `Bearer ${config.bearer_token}` } }
  )

  console.log(`- Article created with id: "${data.data.createArticle.id}"`)

  return createdArticle
}
```

The full import article code is in [index.js](./src/index.js) file.
