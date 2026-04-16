import { tool } from "ai";
import { z } from "zod";

const PEXELS_API_BASE = "https://api.pexels.com";
const SEARCH_TIMEOUT_MS = 15_000;
const MAX_RESULTS = 10;

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  alt: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

interface PexelsVideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  link: string;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  duration: number;
  user: { name: string; url: string };
  video_files: PexelsVideoFile[];
  image: string;
}

const CURATED_IMAGES: Record<string, string[]> = {
  technology: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
  ],
  business: [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  ],
  nature: [
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
    "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&q=80",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80",
  ],
  people: [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80",
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  ],
  food: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
  ],
  architecture: [
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80",
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    "https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=800&q=80",
    "https://images.unsplash.com/photo-1448630360428-65456659e24d?w=800&q=80",
    "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=800&q=80",
  ],
  abstract: [
    "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
    "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=800&q=80",
    "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80",
  ],
  workspace: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
    "https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80",
  ],
  health: [
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
  ],
  travel: [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  ],
  education: [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&q=80",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
  ],
  finance: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80",
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&q=80",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
  ],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  technology: ["tech", "software", "computer", "code", "programming", "digital", "ai", "data", "cyber", "startup", "app", "saas", "developer", "server", "cloud"],
  business: ["business", "corporate", "office", "meeting", "team", "professional", "company", "enterprise", "strategy", "marketing"],
  nature: ["nature", "landscape", "forest", "mountain", "ocean", "sky", "sunset", "sunrise", "outdoor", "garden", "flower", "plant", "tree", "lake", "river"],
  people: ["people", "team", "group", "community", "social", "friends", "family", "crowd", "diverse", "portrait", "human"],
  food: ["food", "restaurant", "cooking", "kitchen", "meal", "recipe", "dining", "chef", "cafe", "drink", "coffee", "bakery"],
  architecture: ["architecture", "building", "city", "skyline", "urban", "interior", "design", "house", "home", "real estate", "apartment", "modern"],
  abstract: ["abstract", "pattern", "gradient", "geometric", "texture", "background", "colorful", "artistic", "creative", "minimal"],
  workspace: ["workspace", "desk", "laptop", "remote work", "home office", "coworking", "productivity", "tools"],
  health: ["health", "fitness", "wellness", "medical", "doctor", "hospital", "yoga", "exercise", "gym", "sport", "nutrition", "mental health"],
  travel: ["travel", "vacation", "tourism", "hotel", "flight", "adventure", "explore", "destination", "beach", "resort"],
  education: ["education", "school", "university", "learning", "student", "teacher", "library", "book", "study", "classroom", "course"],
  finance: ["finance", "money", "banking", "investment", "stock", "crypto", "trading", "wallet", "payment", "fintech", "insurance"],
};

function matchCategory(query: string): string {
  const lowerQuery = query.toLowerCase();
  let bestMatch = "abstract";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  return bestMatch;
}

function getFallbackImages(query: string, count: number): { url: string; width: number; height: number; alt: string; photographer: string; source: string }[] {
  const category = matchCategory(query);
  const images = CURATED_IMAGES[category] || CURATED_IMAGES.abstract;
  return images.slice(0, count).map((url, i) => ({
    url,
    width: 800,
    height: 600,
    alt: `${category} image ${i + 1} related to: ${query}`,
    photographer: "Unsplash",
    source: "unsplash-curated",
  }));
}

const mediaSearchInputSchema = z.object({
  query: z.string().describe("Search query describing the type of image or video needed (e.g. 'modern office workspace', 'mountain landscape sunset', 'team collaboration')"),
  type: z.enum(["photo", "video"]).default("photo").describe("Type of media to search for. Default: 'photo'"),
  count: z.number().min(1).max(10).default(3).describe("Number of results to return (1-10). Default: 3"),
  orientation: z.enum(["landscape", "portrait", "square"]).optional().describe("Preferred orientation. Omit for any orientation"),
  size: z.enum(["large", "medium", "small"]).optional().describe("Preferred size. 'large' for hero/banner images, 'medium' for cards, 'small' for thumbnails. Default: 'medium'"),
});

export const mediaSearchTool = tool({
  description: `Search for high-quality stock photos and videos to use in web applications.

USE THIS TOOL PROACTIVELY when building any UI that needs visual content:
- Hero sections need a background image or video
- About/team pages need people photos
- Product pages need lifestyle or product imagery
- Blog posts need header images
- Testimonial sections need avatar/portrait photos
- Landing pages need visual content for every section
- Feature sections can benefit from relevant imagery
- Background videos for immersive sections

Returns direct CDN URLs that can be used immediately in <img> tags, CSS background-image, or <video> elements. All images are free to use (Pexels license).

IMPORTANT: Always use real, relevant images — never leave placeholder text like "Image here" or use broken placeholder URLs. Call this tool to get proper image URLs.`,
  inputSchema: mediaSearchInputSchema,
  execute: async ({ query, type, count, orientation, size }) => {
    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
      if (type === "video") {
        return {
          success: true,
          source: "fallback",
          note: "PEXELS_API_KEY not set — video search requires a Pexels API key. Use a free stock video URL or embed a YouTube/Vimeo video instead.",
          videos: [],
          suggestion: "For video backgrounds, consider using a CSS gradient animation or a static hero image from this tool (type: 'photo') as an alternative.",
        };
      }

      const fallbackResults = getFallbackImages(query, count);
      return {
        success: true,
        source: "unsplash-curated",
        note: "Using curated Unsplash images. Set PEXELS_API_KEY for search-based results matching your exact query.",
        photos: fallbackResults,
        usage: "Use these URLs directly in <img src> or CSS background-image. They are free to use via Unsplash.",
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

    try {
      const endpoint = type === "video"
        ? `${PEXELS_API_BASE}/videos/search`
        : `${PEXELS_API_BASE}/v1/search`;

      const params = new URLSearchParams({
        query,
        per_page: String(Math.min(count, MAX_RESULTS)),
      });
      if (orientation) params.set("orientation", orientation);
      if (size) params.set("size", size);

      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          Authorization: apiKey,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          if (type === "photo") {
            const fallbackResults = getFallbackImages(query, count);
            return {
              success: true,
              source: "unsplash-curated-ratelimit",
              note: "Pexels rate limit reached. Returning curated Unsplash images instead.",
              photos: fallbackResults,
            };
          }
          return {
            success: false,
            error: "Pexels API rate limit reached. Try again in a minute.",
          };
        }
        return {
          success: false,
          error: `Pexels API error: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();

      if (type === "video") {
        const rawVideos = Array.isArray(data?.videos) ? data.videos as PexelsVideo[] : [];
        const videos = rawVideos
          .map((v) => {
            const files = Array.isArray(v.video_files) ? v.video_files : [];
            const hdFile = files
              .filter((f) => f.quality === "hd" || f.quality === "sd")
              .sort((a, b) => b.width - a.width)[0];
            const videoUrl = hdFile?.link || files[0]?.link;
            if (!videoUrl) return null;
            return {
              url: videoUrl,
              poster: v.image,
              width: v.width,
              height: v.height,
              duration: v.duration,
              photographer: v.user?.name || "Unknown",
              source: "pexels",
              pexelsUrl: v.url,
            };
          })
          .filter((v): v is NonNullable<typeof v> => v !== null);

        if (videos.length === 0) {
          return {
            success: true,
            source: "pexels",
            videos: [],
            note: `No videos found for "${query}". Try a broader search term, or use type "photo" for a static image instead.`,
          };
        }

        return {
          success: true,
          source: "pexels",
          videos,
          usage: "Use video URLs in <video src> elements. Use poster URLs for the poster attribute. Credit: Pexels (free to use).",
          example: `<video autoPlay muted loop playsInline poster="{poster}"><source src="{url}" type="video/mp4" /></video>`,
        };
      }

      const rawPhotos = Array.isArray(data?.photos) ? data.photos as PexelsPhoto[] : [];
      const photos = rawPhotos.map((p) => ({
        url: size === "small" ? p.src.small : size === "large" ? p.src.large2x : p.src.large,
        urlSmall: p.src.small,
        urlMedium: p.src.medium,
        urlLarge: p.src.large2x,
        width: p.width,
        height: p.height,
        alt: p.alt || `Photo related to: ${query}`,
        photographer: p.photographer,
        source: "pexels",
        pexelsUrl: p.url,
      }));

      if (photos.length === 0) {
        const fallbackResults = getFallbackImages(query, count);
        return {
          success: true,
          source: "unsplash-curated-no-results",
          note: `No Pexels results for "${query}". Returning curated Unsplash images instead.`,
          photos: fallbackResults,
        };
      }

      return {
        success: true,
        source: "pexels",
        photos,
        usage: "Use these URLs directly in <img src> or CSS background-image. Multiple sizes available (urlSmall, urlMedium, urlLarge). Credit: Pexels (free to use).",
      };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        if (type === "photo") {
          const fallbackResults = getFallbackImages(query, count);
          return {
            success: true,
            source: "unsplash-curated-timeout",
            note: "Pexels API timed out. Returning curated Unsplash images instead.",
            photos: fallbackResults,
          };
        }
        return { success: false, error: "Pexels API request timed out." };
      }
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Media search failed: ${message}` };
    } finally {
      clearTimeout(timeout);
    }
  },
});
