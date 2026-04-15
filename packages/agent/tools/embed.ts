import { tool } from "ai";
import { z } from "zod";

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const DEFAULT_MODEL = "voyage-3.5-lite";

const embedInputSchema = z.object({
  texts: z
    .array(z.string())
    .min(1)
    .max(128)
    .describe(
      "Array of text strings to embed. Batch up to 128 strings at once for efficiency.",
    ),
  model: z
    .enum(["voyage-3.5", "voyage-3.5-lite"])
    .optional()
    .describe(
      "Voyage model to use. voyage-3.5-lite is faster and cheaper; voyage-3.5 gives higher quality embeddings. Default: voyage-3.5-lite.",
    ),
  inputType: z
    .enum(["query", "document", "none"])
    .optional()
    .describe(
      "Optimize embeddings for a specific use-case. Use 'query' when embedding a search query, 'document' when embedding text to be searched. Omit or use 'none' for symmetric similarity tasks.",
    ),
  compareAgainst: z
    .array(z.string())
    .optional()
    .describe(
      "Optional list of reference texts. When provided, the tool computes cosine similarity scores between each input text and each reference text, returning a ranked similarity matrix. Useful for semantic search, finding related code, duplicate detection, or clustering.",
    ),
});

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function fetchEmbeddings(
  texts: string[],
  model: string,
  inputType?: string,
): Promise<{ embeddings: number[][]; usage: { total_tokens: number } }> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VOYAGE_API_KEY environment variable is not set. Add it to your Replit secrets.",
    );
  }

  const body: Record<string, unknown> = { input: texts, model };
  if (inputType && inputType !== "none") {
    body.input_type = inputType;
  }

  const res = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Voyage API error ${res.status}: ${errText}`);
  }

  const json = (await res.json()) as {
    data: Array<{ embedding: number[]; index: number }>;
    usage: { total_tokens: number };
  };

  const sorted = json.data.sort((a, b) => a.index - b.index);
  return {
    embeddings: sorted.map((d) => d.embedding),
    usage: json.usage,
  };
}

export const embedTool = tool({
  description: `Generate semantic embeddings for text using Voyage AI (voyage-3.5 or voyage-3.5-lite).

USE THIS TOOL WHEN YOU NEED TO:
- Search the codebase semantically (embed a query + embed code chunks, rank by similarity)
- Find similar or duplicate files, functions, or content in the project
- Cluster or group related pieces of code/text
- Implement semantic search features inside the user's app
- Understand which parts of a codebase are conceptually related
- Add vector search, RAG (retrieval-augmented generation), or recommendation logic to the user's project

HOW IT WORKS:
- Input one or more texts; receive back high-dimensional float vectors (embeddings)
- Texts that are semantically similar will have high cosine similarity
- Use inputType='query' for search queries and 'document' for the texts being searched
- Set compareAgainst to a list of reference texts to get ranked similarity scores automatically

EMBEDDING DIMENSIONS:
- voyage-3.5: 1024 dimensions, higher quality
- voyage-3.5-lite: 512 dimensions, faster and cheaper, good default

EXAMPLES:
- Find which files are most relevant to a feature: embed the feature description as query, embed file summaries as documents
- Semantic duplicate detection: embed all function signatures, compare pairwise
- Add search to user's app: embed all content at index time, embed user query at search time, return top-k by cosine similarity`,

  inputSchema: embedInputSchema,

  execute: async ({ texts, model = DEFAULT_MODEL, inputType, compareAgainst }) => {
    try {
      const { embeddings: inputEmbeddings, usage } = await fetchEmbeddings(
        texts,
        model,
        inputType,
      );

      if (!compareAgainst || compareAgainst.length === 0) {
        return {
          success: true,
          model,
          dimensions: inputEmbeddings[0]?.length ?? 0,
          count: inputEmbeddings.length,
          embeddings: inputEmbeddings,
          usage,
        };
      }

      const refInputType =
        inputType === "query" ? "document" : inputType === "document" ? "query" : inputType;
      const { embeddings: refEmbeddings } = await fetchEmbeddings(
        compareAgainst,
        model,
        refInputType,
      );

      const similarities = texts.map((text, i) =>
        compareAgainst
          .map((ref, j) => ({
            inputText: text.slice(0, 120),
            referenceText: ref.slice(0, 120),
            similarity: cosineSimilarity(inputEmbeddings[i], refEmbeddings[j]),
          }))
          .sort((a, b) => b.similarity - a.similarity),
      );

      return {
        success: true,
        model,
        dimensions: inputEmbeddings[0]?.length ?? 0,
        usage,
        similarities,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: message,
      };
    }
  },
});
