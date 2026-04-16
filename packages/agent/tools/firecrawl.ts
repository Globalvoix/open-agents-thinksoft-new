import { tool } from "ai";
import { z } from "zod";

const SCRAPE_TIMEOUT_MS = 60_000;
const MAX_CONTENT_LENGTH = 12_000;

const firecrawlScrapeInputSchema = z.object({
  url: z.string().url().describe("The URL of the website to scrape"),
  formats: z
    .array(z.enum(["markdown", "html", "screenshot", "links"]))
    .optional()
    .describe(
      "Output formats to request. Default: ['markdown', 'screenshot']",
    ),
  onlyMainContent: z
    .boolean()
    .optional()
    .describe("If true, only extract the main content (no navs/footers). Default: true"),
  includeTags: z
    .array(z.string())
    .optional()
    .describe("HTML tags to specifically include (e.g. ['img', 'svg', 'a'])"),
  waitFor: z
    .number()
    .optional()
    .describe("Milliseconds to wait for page to load before scraping. Default: 3000"),
});

export const firecrawlScrapeTool = tool({
  description: `Scrape a website using Firecrawl to extract its content, screenshots, images, and structure.

USE THIS TOOL when:
- The user asks to build any web application, landing page, SaaS, or product — scrape the top competitor first to clone their design
- You need to capture a website's visual design as a reference for building UI
- You need to extract images, icons, logos, and visual assets from a website
- You need to analyze a competitor's page structure and content layout

The tool returns:
- A screenshot of the page (as a URL you can reference)
- Markdown content of the page
- All links found on the page
- Extracted metadata (title, description, images, favicons)

IMPORTANT: The FIRECRAWL_API_KEY environment variable must be set.`,
  inputSchema: firecrawlScrapeInputSchema,
  execute: async (
    { url, formats, onlyMainContent, includeTags, waitFor },
    { abortSignal },
  ) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error:
          "FIRECRAWL_API_KEY environment variable is not set. Please set it to use Firecrawl features.",
      };
    }

    const requestBody: Record<string, unknown> = {
      url,
      formats: formats ?? ["markdown", "screenshot"],
      onlyMainContent: onlyMainContent ?? true,
      waitFor: waitFor ?? 3000,
    };

    if (includeTags) {
      requestBody.includeTags = includeTags;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);

      if (abortSignal) {
        abortSignal.addEventListener("abort", () => controller.abort(), { once: true });
      }

      let response: Response;
      try {
        response = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      const responseText = await response.text();

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        return {
          success: false,
          error: `Failed to parse Firecrawl response (HTTP ${response.status}): ${responseText.slice(0, 500)}`,
        };
      }

      if (!parsed.success) {
        return {
          success: false,
          error: `Firecrawl API error: ${JSON.stringify(parsed.error ?? parsed)}`,
        };
      }

      const data = parsed.data as Record<string, unknown> | undefined;
      if (!data) {
        return {
          success: false,
          error: "Firecrawl returned no data",
        };
      }

      let markdown = (data.markdown as string) ?? "";
      const truncated = markdown.length > MAX_CONTENT_LENGTH;
      if (truncated) {
        markdown = markdown.slice(0, MAX_CONTENT_LENGTH);
      }

      const metadata = data.metadata as Record<string, unknown> | undefined;
      const screenshot = data.screenshot as string | undefined;
      const links = data.links as string[] | undefined;

      const extractedImages: string[] = [];
      if (metadata) {
        if (metadata.ogImage) extractedImages.push(metadata.ogImage as string);
        if (metadata.favicon) extractedImages.push(metadata.favicon as string);
      }

      const imgRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
      let match;
      while ((match = imgRegex.exec(markdown)) !== null) {
        if (match[1]) extractedImages.push(match[1]);
      }

      return {
        success: true,
        url,
        screenshot: screenshot ?? null,
        markdown,
        truncated,
        links: links?.slice(0, 15) ?? [],
        metadata: metadata
          ? {
              title: metadata.title ?? null,
              description: metadata.description ?? null,
              ogImage: metadata.ogImage ?? null,
              favicon: metadata.favicon ?? null,
              language: metadata.language ?? null,
            }
          : null,
        extractedImages: [...new Set(extractedImages)].slice(0, 5),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Firecrawl scrape failed: ${message}`,
      };
    }
  },
});

const firecrawlSearchInputSchema = z.object({
  query: z.string().describe("Search query to find relevant websites"),
  limit: z
    .number()
    .optional()
    .describe("Maximum number of results to return. Default: 5"),
});

export const firecrawlSearchTool = tool({
  description: `Search the web using Firecrawl to find relevant websites for competitor research.

USE THIS TOOL to find the top competitor website URL before scraping it.
For example, if the user wants to build a "project management tool", search for "best project management tool website" to find competitors like Asana, Monday.com, Linear, etc.

Returns a list of URLs with titles and descriptions that you can then scrape with firecrawl_scrape.

IMPORTANT: The FIRECRAWL_API_KEY environment variable must be set.`,
  inputSchema: firecrawlSearchInputSchema,
  execute: async ({ query, limit }, { abortSignal }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error:
          "FIRECRAWL_API_KEY environment variable is not set. Please set it to use Firecrawl features.",
      };
    }

    const requestBody = {
      query,
      limit: limit ?? 5,
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

      if (abortSignal) {
        abortSignal.addEventListener("abort", () => controller.abort(), { once: true });
      }

      let response: Response;
      try {
        response = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      const responseText = await response.text();

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        return {
          success: false,
          error: `Failed to parse Firecrawl response (HTTP ${response.status}): ${responseText.slice(0, 500)}`,
        };
      }

      if (!parsed.success) {
        return {
          success: false,
          error: `Firecrawl API error: ${JSON.stringify(parsed.error ?? parsed)}`,
        };
      }

      const data = parsed.data as Array<Record<string, unknown>> | undefined;
      if (!data || data.length === 0) {
        return {
          success: true,
          results: [],
          message: "No results found",
        };
      }

      const results = data.map((item) => ({
        url: item.url as string,
        title: item.title as string | null,
        description: item.description as string | null,
      }));

      return {
        success: true,
        results,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Firecrawl search failed: ${message}`,
      };
    }
  },
});
