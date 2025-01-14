# gatsby-plugin-recommend-article

Gatsby plugin to recommend articles based on OpenAI embeddings API and Qdrant vector search.

[View the demo site on GitHub Pages](https://miyamo2.github.io/gatsby-demo-plugin-recommend-article/)  
[View the demo repository](https://github.com/miyamo2/gatsby-demo-plugin-recommend-article)

## Install

### with npm

```sh
npm install gatsby-plugin-recommend-article
```

### with yarn

```sh
yarn add gatsby-plugin-recommend-article
```

### with pnpm

```sh
pnpm add gatsby-plugin-recommend-article
```

### with bun

```sh
bun add gatsby-plugin-recommend-article
```

## Quick start

1. **Add the plugin to your `gatsby-config.js`**

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-recommend-article`,
      options: {
        qdrant: {
          url: "<your-qdrant-url>",
        },
        openai: {
          apiKey: "<your-openai>",
        },
        limit: 3,
        toPayload: ({ node }) => {
          return {
            title: node.frontmatter.title,
            content: node.excerpt,
            tags: node.frontmatter.tags,
          };
        },
      },
    },
  ],
};
```

2. **Query for recommended articles**

```graphql
query {
  allMarkdownRemark(filter: { id: { eq: "xxxx" } }) {
    nodes {
      id
      excerpt
      recommends {
        id
        excerpt
      }
    }
  }
}
```

```json
{
  "data": {
    "allMarkdownRemark": {
      "nodes": [
        {
          "id": "xxxx",
          "excerpt": "...",
          "recommends": [
            {
              "id": "yyyy",
              "excerpt": "..."
            },
            {
              "id": "zzzz",
              "excerpt": "..."
            },
            ...
          ]
        },
      ]
    }
  }
}
```

## Options

| Name      | Type     | Description                                                                                               | Default                                   | Required |
|-----------|----------|-----------------------------------------------------------------------------------------------------------|-------------------------------------------|----------|
| qdrant    | object   | Configuration for Qdrant.                                                                                 | -                                         | ✅        |
| openai    | object   | Configuration for OpenAI.                                                                                 | -                                         | ❌        |
| limit     | number   | Maximum number of recommended articles.                                                                   | 5                                         | ❌        |
| nodeType  | string   | Type of node to add `recommends` field. Also, the type of `recommends` is an array of the specified type. | "MarkdownRemark"                          | ❌        |
| toPayload | function | Function to convert node to payload. payload is only used to generate vector.                             | `({ node }) => { content: node.excerpt }` | ❌        |

### qdrant

| Name           | Type    | Description                            | Default    | Required |
|----------------|---------|----------------------------------------|------------|----------|
| url            | string  | URL of the Qdrant server               | -          | ✅        |
| apiKey         | string  | API key for authenticating with Qdrant | -          | ❌        |
| https          | boolean | Whether to use HTTPS                   | false      | ❌        |
| headers        | object  | Additional headers for requests        | `{}`       | ❌        |
| onDisk         | boolean | Whether to use on-disk storage         | false      | ❌        |
| collectionName | string  | Name of the Qdrant collection to use   | "articles" | ❌        |

### openai

| Name           | Type   | Description                            | Default                  | Required |
|----------------|--------|----------------------------------------|--------------------------|----------|
| baseURL        | string | base URL for the OpenAI API            | -                        | ❌        |
| apiKey         | string | API key for authenticating with OpenAI | -                        | ❌        |
| organization   | string | ID of the OpenAI organization          | -                        | ❌        |
| project        | string | ID of the OpenAI project               | -                        | ❌        |
| embeddingModel | string | Model used for generating embeddings   | "text-embedding-3-small" | ❌        |
| embeddingSize  | number | Size of the embedding vector           | 1536                     | ❌        |

## Contributing

Feel free to open a PR or an Issue.

However, you must promise to follow our [Code of Conduct](https://github.com/miyamo2/gatsby-plugin-recommend-article/blob/main/CODE_OF_CONDUCT.md).

See [here](https://github.com/miyamo2/gatsby-plugin-recommend-article/blob/main/CONTRIBUTING.md) for more details on contributing.

## License

**gatsby-plugin-recommend-article** released under the [MIT License](https://github.com/miyamo2/gatsby-plugin-recommend-article/blob/main/LICENSE)
