import type { Metadata } from "next";

const SITE_URL = "https://screenprintingbali.com";

export function serviceMetadata(slug: string, title: string, description: string): Metadata {
  const url = `${SITE_URL}/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Screenprinting Bali",
      type: "website",
      locale: "en_US",
      images: [{ url: "/images/spb_logo.png", width: 1200, height: 1200, alt: "Screenprinting Bali" }],
    },
  };
}

export function sitePageMetadata(path: string, title: string, description: string): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...(path === "/" ? { languages: localizedHomeAlternates } : {}),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Screenprinting Bali",
      type: "website",
      locale: "en_US",
      images: [{ url: "/images/spb_logo.png", width: 1200, height: 1200, alt: "Screenprinting Bali" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/spb_logo.png"],
    },
  };
}

export const localizedHomeAlternates = {
  en: SITE_URL,
  id: `${SITE_URL}/id`,
  "zh-Hans": `${SITE_URL}/zh-cn`,
  "x-default": SITE_URL,
};
