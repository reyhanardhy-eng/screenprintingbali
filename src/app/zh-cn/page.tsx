import type { Metadata } from "next";
import LocalizedHomePage from "@/components/LocalizedHomePage";
import { localizedHomeAlternates } from "@/lib/seo-metadata";

const url = "https://screenprintingbali.com/zh-cn";

export const metadata: Metadata = {
  title: "巴厘岛服装印花与品牌周边制作",
  description: "在巴厘岛制作服装品牌系列、丝网印刷、DTF 转印和刺绣。通过 WhatsApp 确认起订量、样品、报价、时间和配送。",
  alternates: { canonical: url, languages: localizedHomeAlternates },
  openGraph: {
    title: "巴厘岛服装印花与品牌周边制作 | Screenprinting Bali",
    description: "在巴厘岛制作服装品牌系列、丝网印刷、DTF 转印和刺绣。通过 WhatsApp 确认起订量、报价、时间和配送。",
    url,
    siteName: "Screenprinting Bali",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/images/spb_logo.png", width: 1200, height: 1200, alt: "Screenprinting Bali" }],
  },
};

export default function ChineseHomePage() {
  return <LocalizedHomePage locale="zh-cn" />;
}
