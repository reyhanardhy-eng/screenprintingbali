import ServiceLandingPage, { type ServicePageData } from "@/components/ServiceLandingPage";
import { sitePageMetadata } from "@/lib/seo-metadata";

const title = "Ordering Custom Apparel in Bali: From Sample to Brand Drop";
const description = "Plan a custom apparel order in Bali: compare screen printing and DTF, prepare artwork, choose quantities, and arrange pickup or a shipping quote.";

export const metadata = sitePageMetadata("/ordering-apparel-in-bali", "Custom Apparel in Bali: Ordering Guide for Brands", description);

const guide: ServicePageData = {
  kind: "guide",
  slug: "ordering-apparel-in-bali",
  title,
  description,
  eyebrow: "For visiting founders and clothing brands",
  intro: "Building a clothing brand while in Bali, or arranging merchandise from overseas? Start with a clear product brief. This guide explains what to decide before requesting a quote, so your sample, production run, and delivery can be planned together.",
  facts: [
    { label: "Screen printing", value: "From 24 garments" },
    { label: "DTF samples", value: "From one piece" },
    { label: "Quote essentials", value: "Artwork + quantity + garment" },
    { label: "Before your flight", value: "Confirm timing and delivery" },
  ],
  sections: [
    {
      title: "Choose the print process before choosing the quantity",
      paragraphs: ["Screen printing suits a planned run with a defined design and colour count. Setup is shared across the run, so ask for a comparison at different quantities instead of choosing solely by the lowest total cost. Order an amount that fits your launch and stock plan.", "DTF is useful for full-colour artwork, a first sample, or a short run. A DTF sample can show artwork scale and placement, but its texture differs from screen printing. If the final finish matters, discuss a sample using the intended production method."],
    },
    {
      title: "Send a brief your studio can actually quote",
      paragraphs: ["Include the garment type, fabric preference, total quantity, size breakdown, print dimensions, print positions, and artwork. Tell us whether you have blanks already or need help sourcing an available garment. References help explain the direction; production-ready artwork helps confirm the print details."],
      bullets: ["Product and garment colour, with sizes and quantities.", "Artwork files or references, print size, and front or back placement.", "Labels, embroidery, packaging, or other finishing you want quoted.", "Required date, Bali pickup or delivery destination, and any fixed travel dates."],
    },
    {
      title: "Approve the sample and the production details",
      paragraphs: ["Before committing to a brand drop, confirm the artwork, placement, garment, sizes, and finishing in writing. Ask whether a paid sample is appropriate and what it will demonstrate. Keep an approved reference for the bulk run.", "Brand Starter can help connect design, printing, labels, and finishing. Custom cut-and-sew garment development is a separate requirement: describe what you need and ask us to confirm the scope before placing an order."],
    },
    {
      title: "Visiting Bali? Plan around production, not just your departure",
      paragraphs: ["Screen printing currently has an indicative 7–10 day production window after artwork approval; DTF has an indicative 1–3 day window. These are estimates, not guaranteed collection dates. Sourcing, artwork changes, workload, finishing, and delivery can change the schedule.", "If you leave before the order is ready, request a shipping quote with the destination and deadline. Confirm courier availability, transit estimates, and any destination import requirements before booking the order. Arrange a studio visit or pickup through WhatsApp first."],
    },
  ],
  faqs: [
    { question: "Can I start a clothing brand in Bali with a small order?", answer: "You can begin with a DTF sample or short run. Screen printing starts at 24 garments. Share your product and launch plan so we can recommend a suitable route and quote the scope." },
    { question: "Can I arrange an order from outside Indonesia?", answer: "Send your brief through WhatsApp. We can discuss the artwork, garment options, and production details remotely, then quote shipping for your destination." },
    { question: "Is a calculator estimate the final price?", answer: "No. The calculator is a ballpark estimate. Your confirmed quote depends on garment availability, artwork, quantity, print positions, finishing, and delivery." },
    { question: "Should I make one piece or a larger run?", answer: "Use a sample to settle the design first. For a planned launch, compare bulk quantities: screen-print setup costs can be spread across more garments. Choose stock you can realistically sell." },
  ],
  ctaLabel: "Discuss your first run",
  whatsappMessage: "Hi, I am planning an apparel order in Bali. Product: __. Quantity and sizes: __. Artwork: __. Finishing: __. Required date: __. Delivery destination: __. Please advise on samples and a production quote.",
};

export default function OrderingGuidePage() {
  return <ServiceLandingPage data={guide} />;
}
