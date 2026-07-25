import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jollofplate.com";

export const SITE_NAME = "JollofPlate";
export const SITE_TAGLINE = "Every Plate Tells a Story";
export const SITE_LOCATION = "Ikorodu, Lagos, Nigeria";

export const DEFAULT_OG_IMAGE = {
  url: "/og/jollofplate-og.png",
  width: 1730,
  height: 909,
  alt: "JollofPlate — Every Plate Tells a Story. Order jollof, groceries & catering in Ikorodu, Lagos.",
};

export const SITE_KEYWORDS = [
  "JollofPlate",
  "jollof rice",
  "Ikorodu food delivery",
  "jollof delivery Ikorodu",
  "food pickup Lagos",
  "Lagos Nigeria",
  "party jollof",
  "fried rice",
  "swallow and soups",
  "food catering Lagos",
  "order jollof online",
  "WhatsApp food order",
  "groceries",
  "frozen foods",
  "corporate lunch",
];

type PageSeoOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /** Relative path or absolute image URL used for Open Graph / Twitter. */
  image?: string | null;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  noIndex?: boolean;
};

/** Make sure share crawlers always get an absolute image URL. */
export function absoluteAssetUrl(pathOrUrl?: string | null): string {
  const fallback = new URL(DEFAULT_OG_IMAGE.url, SITE_URL).toString();
  if (!pathOrUrl?.trim()) return fallback;

  const value = pathOrUrl.trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;

  try {
    return new URL(value.startsWith("/") ? value : `/${value}`, SITE_URL).toString();
  } catch {
    return fallback;
  }
}

function truncateDescription(value: string, max = 200) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  noIndex = false,
}: PageSeoOptions): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const pageTitle = `${title} | ${SITE_NAME}`;
  const pageDescription = truncateDescription(description);
  const hasCustomImage = Boolean(image?.trim());
  const imageUrl = absoluteAssetUrl(image);
  const ogImage = {
    url: imageUrl,
    width: hasCustomImage
      ? (imageWidth ?? 1200)
      : DEFAULT_OG_IMAGE.width,
    height: hasCustomImage
      ? (imageHeight ?? 630)
      : DEFAULT_OG_IMAGE.height,
    alt: imageAlt?.trim() || (hasCustomImage ? title : DEFAULT_OG_IMAGE.alt),
  };

  return {
    title: { absolute: pageTitle },
    description: pageDescription,
    keywords: keywords ?? SITE_KEYWORDS,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
      locale: "en_NG",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
  };
}
