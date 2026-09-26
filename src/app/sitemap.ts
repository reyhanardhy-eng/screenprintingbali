import type { MetadataRoute } from "next";

const site = "https://screenprintingbali.com";
const homeLanguages = {
  en: site,
  id: `${site}/id`,
  "zh-Hans": `${site}/zh-cn`,
  "x-default": site,
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site,
      alternates: { languages: homeLanguages },
    },
    { url: `${site}/id`, alternates: { languages: homeLanguages } },
    { url: `${site}/zh-cn`, alternates: { languages: homeLanguages } },
    { url: `${site}/screen-printing-bali` },
    { url: `${site}/dtf-printing-bali` },
    { url: `${site}/apparel-brand-starter-bali` },
    { url: `${site}/services` },
    { url: `${site}/work` },
    { url: `${site}/pricing` },
    { url: `${site}/studio` },
    { url: `${site}/faq` },
    { url: `${site}/contact` },
  ];
}
