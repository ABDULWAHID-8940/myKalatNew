export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "telegram";

export type SocialMediaLink = {
  platform: SocialPlatform;
  username: string;
  followers: string;
};

const SOCIAL_PLATFORMS: ReadonlySet<string> = new Set([
  "instagram",
  "facebook",
  "twitter",
  "linkedin",
  "tiktok",
  "youtube",
  "telegram",
]);

const toStringSafe = (value: unknown): string => {
  if (value == null) return "";
  return typeof value === "string" ? value : String(value);
};

export const parseSocialMediaLinks = (input: unknown): SocialMediaLink[] => {
  if (!input) return [];

  let parsed: unknown = input;

  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch {
      return [];
    }
  }

  // Newer shape (array): [{ platform, username, followers }]
  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const platform = (item as any).platform;
        if (typeof platform !== "string" || !SOCIAL_PLATFORMS.has(platform)) {
          return null;
        }
        return {
          platform: platform as SocialPlatform,
          username: toStringSafe((item as any).username),
          followers: toStringSafe((item as any).followers),
        } satisfies SocialMediaLink;
      })
      .filter(Boolean) as SocialMediaLink[];
  }

  // Legacy shape (object): { instagram: { username, followers }, ... }
  if (parsed && typeof parsed === "object") {
    return Object.entries(parsed as Record<string, any>)
      .map(([platform, data]) => {
        if (!SOCIAL_PLATFORMS.has(platform)) return null;
        return {
          platform: platform as SocialPlatform,
          username: toStringSafe(data?.username),
          followers: toStringSafe(data?.followers),
        } satisfies SocialMediaLink;
      })
      .filter(Boolean) as SocialMediaLink[];
  }

  return [];
};
