import { GatsbyNode, Node } from "gatsby";
import { QdrantClient } from "@qdrant/js-client-rest";
import { isPluginOptions } from "./options";

interface IPoint {
  id: string;
  vector: number[];
}

export const pluginOptionsSchema: GatsbyNode["pluginOptionsSchema"] = ({
  Joi,
}) => {
  return Joi.object({
    qdrant: Joi.object()
      .keys({
        url: Joi.string().required(),
        apiKey: Joi.string(),
        https: Joi.boolean(),
        headers: Joi.object().default({} as Record<string, any>),
        onDisk: Joi.boolean(),
        collectionName: Joi.string().default("articles"),
      })
      .required()
      .description("Qdrant options. See: https://github.com/qdrant/qdrant-js"),
    openai: Joi.object()
      .keys({
        baseURL: Joi.string(),
        apiKey: Joi.string(),
        organization: Joi.string(),
        project: Joi.string(),
        embeddingModel: Joi.string().default("text-embedding-3-small"),
        embeddingSize: Joi.number().default(1536),
      })
      .description(
        "OpenAI options. See: https://platform.openai.com/docs/api-reference/introduction",
      ),
    limit: Joi.number().default(5),
    nodeType: Joi.string().default("MarkdownRemark"),
    toPayload: Joi.func()
      .arity(1)
      .default((node: Node) => JSON.stringify({ body: node.excerpt ?? "" })),
  });
};

export const createResolvers: GatsbyNode["createResolvers"] = async (
  { reporter, getNodesByType, createResolvers },
  pluginOptions,
) => {
  reporter.info("gatsby-plugin-recommend-article: createResolvers");
  if (!isPluginOptions(pluginOptions, reporter)) {
    reporter.panic("gatsby-plugin-recommend-article: pluginOptions is invalid");
    return;
  }

  const {
    qdrant: qdrantOption,
    openai: openaiOptions,
    nodeType,
    toPayload,
    limit,
  } = pluginOptions;

  const qdrantClient = new QdrantClient({
    url: qdrantOption.url,
    apiKey: qdrantOption.apiKey,
    https: qdrantOption.https,
    headers: qdrantOption.headers,
  });

  const { exists: collectionExists } = await qdrantClient.collectionExists(
    qdrantOption.collectionName,
  );
  if (!collectionExists) {
    const success = await qdrantClient.createCollection(
      qdrantOption.collectionName,
      {
        vectors: {
          size: openaiOptions.embeddingSize,
          distance: "Cosine",
          on_disk: qdrantOption.onDisk,
        },
        optimizers_config: qdrantOption.optimizersConfig ?? undefined,
      },
    );
    if (!success) {
      reporter.panic(
        "gatsby-plugin-recommend-article: createCollection failed",
      );
      return;
    }
  }

  const openaiAPIEndpoint = `${openaiOptions.baseURL ?? "https://api.openai.com"}/v1/embeddings`;

  const openaiAPIHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openaiOptions.apiKey}`,
  };
  if (openaiOptions.organization) {
    openaiAPIHeaders["OpenAI-Organization"] = openaiOptions.organization;
  }
  if (openaiOptions.project) {
    openaiAPIHeaders["OpenAI-Project"] = openaiOptions.project;
  }

  const points: IPoint[] = await Promise.all(
    getNodesByType(nodeType).map(async (node: Node) => {
      const payload = toPayload(node);
      const response = await fetch(openaiAPIEndpoint, {
        method: "POST",
        headers: openaiAPIHeaders,
        body: JSON.stringify({
          model: openaiOptions.embeddingModel,
          input: payload,
          dimensions: openaiOptions.embeddingSize,
        }),
      });
      if (!response.ok) {
        reporter.error(
          `gatsby-plugin-recommend-article: openaiAPI failed: ${response.statusText}`,
        );
        return {
          id: node.id,
          vector: [],
        };
      }
      const body = await response.json();
      const vector = body?.data[0]?.embedding;

      return {
        id: node.id,
        vector: vector,
      };
    }),
  );

  await qdrantClient.upsert(qdrantOption.collectionName, {
    wait: true,
    points: points,
  });

  const resolvers = {};
  resolvers[nodeType] = {
    recommends: {
      type: [nodeType],
      resolve: async (source, args, context, info) => {
        const id = source.id as string;
        const recommends = await qdrantClient.recommend(
          qdrantOption.collectionName,
          {
            positive: [id],
            limit: limit,
            with_payload: false,
            with_vector: false,
          },
        );
        const ids = recommends.map((point) => {
          return point.id as string;
        });

        const { entries } = await context.nodeModel.findAll({
          type: nodeType,
          query: {
            filter: { id: { in: ids } },
          },
        });
        return entries;
      },
    },
  };
  createResolvers(resolvers);
  reporter.success("gatsby-plugin-recommend-article: createResolvers success");
};
