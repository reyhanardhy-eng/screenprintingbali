import ServiceLandingPage, { type ServicePageData } from "@/components/ServiceLandingPage";
import { serviceMetadata } from "@/lib/seo-metadata";

const slug = "screen-printing-bali";
const title = "Bulk Screen Printing in Bali for Clothing Brands";
const metadataTitle = "Bulk Screen Printing Bali | Clothing Brands";
const description = "Bulk screen printing in Bali for clothing brands. Garment MOQ 24 pieces, up to four colours, with a 7–10 day estimate after artwork approval.";

export const metadata = serviceMetadata(slug, metadataTitle, description);

const page: ServicePageData = {
  slug,
  title,
  description,
  eyebrow: "For clothing brands, teams, and merchandise runs",
  intro: "Need a consistent print across a proper run? We screen print apparel in Bali for brands that have a design, a quantity in mind, and a launch date to work toward. Share the brief on WhatsApp and get a quote based on the actual garment and artwork.",
  facts: [
    { label: "Garment minimum", value: "24 pieces" },
    { label: "Print colours", value: "Up to 4 per design" },
    { label: "Indicative lead time", value: "7–10 days" },
    { label: "Production", value: "In-house in Bali" },
  ],
  sections: [
    {
      title: "A practical choice for a planned brand drop",
      paragraphs: [
        "Screen printing is a strong fit when you are producing a run of garments with a defined artwork, colour count, and quantity. Each ink colour needs screen preparation, so the setup is a one-time part of the quote. As that setup is shared across more pieces, the per-piece cost can improve. We will show the quantities and assumptions in your quote so you can choose a run your business can actually sell.",
        "This page is for apparel decoration and related finishing. It does not promise custom cut-and-sew garment development. Tell us whether you are bringing blanks or need us to source an available garment, and we will confirm what can be supplied.",
      ],
      bullets: [
        "Garment screen printing starts at 24 pieces; product and artwork details can affect the final scope.",
        "We offer up to four print colours per design.",
        "We use plastisol or water-based ink where suitable for the garment and artwork.",
      ],
    },
    {
      title: "What goes into a useful screen-print quote",
      paragraphs: [
        "A quote depends on the garment, fabric, print size, number of colours, print positions, total quantity, and any labels or finishing. Share a reference image or artwork file if you have one. If the artwork is unfinished, tell us what you have so we can confirm whether design help is needed.",
        "For a new design, we recommend approving a mockup and discussing a paid sample before committing to a larger run. A DTF sample can help check placement and artwork, but it will not reproduce the exact feel of a later screen-printed run. Ask us which sample route makes sense for your job.",
      ],
      bullets: [
        "Product or blank garment and fabric preference.",
        "Quantity, size breakdown, print dimensions, colours, and front or back placement.",
        "Artwork or reference, required date, and whether the order needs Bali pickup or delivery elsewhere.",
      ],
    },
    {
      title: "Plan production around your launch date",
      paragraphs: [
        "Our current screen-print lead-time estimate is 7–10 days after the production details and artwork are approved. Garment sourcing, artwork changes, order size, and delivery can affect the schedule. If you are visiting Bali, confirm the production slot before booking around a flight date.",
        "Production is handled in-house in Bali. We check the order before delivery and share progress photos before it ships. Ask us to confirm pickup, local courier delivery, or shipping options for your destination and timing.",
      ],
    },
  ],
  faqs: [
    { question: "What is the minimum for screen printing?", answer: "Garment screen printing starts at 24 pieces. We will confirm the minimum for your specific product and design before you place the order." },
    { question: "How much does screen printing cost in Bali?", answer: "The quote depends on the garment, fabric, print dimensions, colours, print positions, quantity, and finishing. Use the website calculator for a ballpark estimate, then request a WhatsApp quote for the confirmed scope." },
    { question: "How long does screen printing take?", answer: "Our current estimate is 7–10 days after artwork approval. We will confirm the production slot and delivery plan for your order." },
    { question: "Can I order one sample first?", answer: "Ask about a paid sample before the bulk run. A DTF sample can check artwork and placement, but its finish differs from screen printing. Confirm the sample method and what it can prove." },
    { question: "Can you ship my order after I leave Bali?", answer: "Yes, we can quote domestic and international shipping. Share your destination and deadline so we can confirm the courier, cost, and schedule." },
  ],
  ctaLabel: "Plan a screen-print run",
  whatsappMessage: "Hi, I’m planning a screen-print order in Bali. Product: __. Quantity: __. Number of colours and print positions: __. Artwork or reference: __. Required date: __. Delivery destination: __. Please confirm the suitable process, availability, and quote.",
};

export default function ScreenPrintingBaliPage() {
  return <ServiceLandingPage data={page} />;
}
