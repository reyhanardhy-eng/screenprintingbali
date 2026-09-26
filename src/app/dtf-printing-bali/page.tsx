import ServiceLandingPage, { type ServicePageData } from "@/components/ServiceLandingPage";
import { serviceMetadata } from "@/lib/seo-metadata";

const slug = "dtf-printing-bali";
const title = "DTF Printing in Bali for Samples and Small Runs";
const metadataTitle = "DTF Printing Bali | Samples and Small Runs";
const description = "Full-colour DTF apparel printing in Bali, from one piece. Check artwork, garment availability, placement, and the 1–3 day estimate with the studio.";

export const metadata = serviceMetadata(slug, metadataTitle, description);

const page: ServicePageData = {
  slug,
  title,
  description,
  eyebrow: "For samples, single pieces, and short runs",
  intro: "Need one printed piece, a full-colour design, or a quick first sample? DTF transfer is the studio’s no-minimum option. Send your design and garment details, then confirm the quote and schedule before production.",
  facts: [
    { label: "Minimum", value: "1 piece" },
    { label: "Colours", value: "Full colour" },
    { label: "Indicative lead time", value: "1–3 days" },
    { label: "Production", value: "In-house in Bali" },
  ],
  sections: [
    {
      title: "Use DTF when flexibility matters",
      paragraphs: [
        "Direct-to-film transfer is a practical option for one-off prints, artwork with many colours, and small test quantities. DTF is available from one piece, with full-colour printing and no screen setup. It can help you check a concept before you plan a larger product run.",
        "A single-piece order and a repeatable apparel drop have different production economics. If the design is intended for a brand launch, ask for both a sample option and a separate quote at realistic bulk quantities. For runs of 24 pieces or more, compare screen printing where the artwork and garment are suitable. Choose a quantity based on expected demand, not a promised discount.",
      ],
      bullets: [
        "DTF is available from one piece.",
        "Full-colour designs are possible without screen setup.",
        "Our 1–3 day lead time is an estimate; confirm availability and delivery timing with us.",
      ],
    },
    {
      title: "A sample helps answer specific questions",
      paragraphs: [
        "Tell us what you want the sample to help you check: artwork scale, placement, colour appearance, or the garment itself. Send the design file or a clear reference and the garment style you have in mind. The quote should confirm what blank is included, the print dimensions, and whether the sample can be compared fairly with your future production method.",
        "If your final run will be screen printed, a DTF sample can help review the artwork and position, but the print feel and process will differ. For a closer production reference, ask the studio whether a screen-print test is available for your artwork and quantity.",
      ],
      bullets: [
        "Product or garment, sizes, and quantity.",
        "Artwork file or reference, print size, and placement.",
        "Required date and Bali pickup or delivery destination.",
      ],
    },
    {
      title: "When to compare another method",
      paragraphs: [
        "For a brand drop, include your expected reorder quantity and target launch date when asking for a quote. Screen printing has a one-time setup per colour, so a higher quantity can spread that setup across more garments. Embroidery may suit logos and badges where a stitched finish is required. Method choice depends on the garment, artwork, order size, and finish you want.",
        "Screen printing and embroidery start at 24 garments, with an estimated 7–10 day lead time. We will confirm the minimum and schedule for your product before you approve the order.",
      ],
    },
  ],
  faqs: [
    { question: "Can I order one DTF-printed shirt in Bali?", answer: "Yes. DTF starts at one piece. Confirm the garment, print size, quote, and availability with us first." },
    { question: "Is DTF a good sample for a screen-print run?", answer: "It can help review artwork scale and placement, but DTF and screen printing have different print processes and feel. Tell the studio what you need to evaluate and ask which sample method is appropriate." },
    { question: "How long does DTF printing take?", answer: "Our current estimate is 1–3 days. Availability, garment sourcing, artwork approval, and delivery can affect the schedule." },
    { question: "Can I use a full-colour or detailed design?", answer: "Yes. Send the artwork or reference so we can check the file, print dimensions, and garment suitability." },
    { question: "Should my brand order DTF for every piece?", answer: "That depends on the design, garment, and quantity. For a planned run of 24 pieces or more, ask for a comparison with screen printing and embroidery before choosing." },
  ],
  ctaLabel: "Ask for a DTF quote",
  whatsappMessage: "Hi, I’d like a DTF print quote in Bali. Product or garment: __. Quantity: __. Artwork or reference: __. Print size and placement: __. Required date: __. Pickup or delivery destination: __. Please confirm availability and total price.",
};

export default function DtfPrintingBaliPage() {
  return <ServiceLandingPage data={page} />;
}
