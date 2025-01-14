import { Node, Reporter } from "gatsby";

export interface IPluginOptions {
  qdrant: QdrantOptions;
  openai: IOpenAIOptions;
  limit: number;
  nodeType: string;
  toPayload: ToPayload;
}

export interface QdrantOptions {
  url: string;
  apiKey?: string;
  https?: boolean;
  headers?: Record<string, any>;
  onDisk?: boolean;
  optimizersConfig?: {
    memmapThreshold?: number;
  };
  collectionName: string;
}

type EmbeddingModel = "text-embedding-3-small" | "text-embedding-3-large";

export interface IOpenAIOptions {
  baseURL?: string;
  apiKey?: string;
  organization?: string;
  project?: string;
  embeddingModel: EmbeddingModel;
  embeddingSize: number;
}

export type ToPayload = (node: Node) => string;

export const isPluginOptions = (
  x: any,
  reporter: Reporter,
): x is IPluginOptions => {
  if (!isQdrantOptions(x.qdrant, reporter)) {
    return false;
  }
  if (!isOpenAIOptions(x.openai, reporter)) {
    return false;
  }
  if (typeof x.limit !== "number") {
    reporter.error("gatsby-plugin-recommend-article: limit should be number");
    return false;
  }
  if (typeof x.nodeType !== "string") {
    reporter.error(
      "gatsby-plugin-recommend-article: nodeType should be string",
    );
    return false;
  }
  if (!isToPayload(x.toPayload, reporter)) {
    return false;
  }
  return true;
};

export const isToPayload = (x: any, reporter: Reporter): x is ToPayload => {
  // TODO: check signature
  if (typeof x !== "function") {
    reporter.error(
      `gatsby-plugin-recommend-article: toPayload should be function, actual`,
    );
    return false;
  }
  return true;
};

export const isQdrantOptions = (
  x: any,
  reporter: Reporter,
): x is QdrantOptions => {
  if (typeof x.url !== "string") {
    reporter.error(
      "gatsby-plugin-recommend-article: qdrant.url should be string",
    );
    return false;
  }
  if (x.apiKey !== undefined && typeof x.apiKey !== "string") {
    reporter.error(
      "gatsby-plugin-recommend-article: qdrant.apiKey should be string or undefined",
    );
    return false;
  }
  if (x.https !== undefined && typeof x.https !== "boolean") {
    reporter.error(
      "gatsby-plugin-recommend-article: qdrant.https should be boolean or undefined",
    );
    return false;
  }
  if (x.headers !== undefined && typeof x.headers !== "object") {
    reporter.error(
      "gatsby-plugin-recommend-article: qdrant.headers should be object",
    );
    return false;
  }
  if (x.onDisk !== undefined && typeof x.onDisk !== "boolean") {
    reporter.error(
      "gatsby-plugin-recommend-article: qdrant.onDisk should be boolean or undefined",
    );
    return false;
  }
  if (typeof x.collectionName !== "string") {
    reporter.error(
      "gatsby-plugin-recommend-article: qdrant.collectionName should be string",
    );
    return false;
  }
  return true;
};

export const isOpenAIOptions = (
  x: any,
  reporter: Reporter,
): x is IOpenAIOptions => {
  if (x.baseURL !== undefined && typeof x.baseURL !== "string") {
    reporter.error(
      "gatsby-plugin-recommend-article: openai.baseURL should be string or undefined",
    );
    return false;
  }
  if (x.apiKey !== undefined && typeof x.apiKey !== "string") {
    reporter.error(
      "gatsby-plugin-recommend-article: openai.apiKey should be string or undefined",
    );
    return false;
  }
  if (x.organization !== undefined && typeof x.organization !== "string") {
    reporter.error(
      "gatsby-plugin-recommend-article: openai.organization should be string or undefined",
    );
    return false;
  }
  if (x.project !== undefined && typeof x.project !== "string") {
    reporter.error(
      "gatsby-plugin-recommend-article: openai.project should be string or undefined",
    );
    return false;
  }
  if (!isEmbeddingModel(x.embeddingModel, reporter)) {
    return false;
  }
  if (typeof x.embeddingSize !== "number") {
    reporter.error("openai.embeddingSize should be number");
    return false;
  }
  return true;
};

export const isEmbeddingModel = (
  x: any,
  reporter: Reporter,
): x is EmbeddingModel => {
  if (x !== "text-embedding-3-small" && x !== "text-embedding-3-large") {
    reporter.error(
      `openai.embeddingModel should be 'text-embedding-3-small' or 'text-embedding-3-large', actual: ${x}`,
    );
    return false;
  }
  return true;
};
