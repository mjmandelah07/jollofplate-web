import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jollofplate.com";

export const SITE_NAME = "JollofPlate";
export const SITE_TAGLINE = "Every Plate Tells a Story";
export const SITE_LOCATION = "Ikorodu, Lagos, Nigeria";

export const DEFAULT_OG_IMAGE = {
  url: "/hero/signature-jollof-hero.png",
  width: 1792,
  height: 1024,
  alt: "JollofPlate signature jollof rice plate",
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
  image?: string;
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  image = DEFAULT_OG_IMAGE.url,
  noIndex = false,
}: PageSeoOptions): Metadata {
  const url = new URL(path, SITE_URL).toString();

  return {
    title,
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [{ ...DEFAULT_OG_IMAGE, url: image }],
      locale: "en_NG",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
  };
}
