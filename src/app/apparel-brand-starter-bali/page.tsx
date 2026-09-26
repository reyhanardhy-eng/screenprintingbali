import ServiceLandingPage, { type ServicePageData } from "@/components/ServiceLandingPage";
import { serviceMetadata } from "@/lib/seo-metadata";

const slug = "apparel-brand-starter-bali";
const title = "Start an Apparel Brand in Bali: Design and Print Package";
const metadataTitle = "Apparel Brand Starter in Bali | Design and Print";
const description = "Plan an apparel drop in Bali with design, printing, labels, and optional finishing. Brand Starter projects start from IDR 2.5m; request a project quote.";

export const metadata = serviceMetadata(slug, metadataTitle, description);

const page: ServicePageData = {
  slug,
  title,
  description,
  eyebrow: "For founders preparing a first apparel drop",
  intro: "Have a brand idea and need a clear first production plan? Brand Starter combines design support with apparel printing and optional finishing in Bali. Share the product, quantity, and target date; the studio will confirm the scope and quote before you commit.",
  facts: [
    { label: "Project reference", value: "From IDR 2.5m" },
    { label: "Indicative lead time", value: "2–4 weeks" },
    { label: "Includes", value: "Design and production" },
    { label: "Finishing", value: "Labels and hangtags optional" },
  ],
  sections: [
    {
      title: "A guided first run, with a defined scope",
      paragraphs: [
        "Brand Starter helps a founder turn an idea into an approved garment and print. The project includes brand and design work with production, custom neck labels and hangtags, plus optional packaging. It is quoted to fit the garments, quantity, artwork, finishing, and delivery requirements.",
        "This is an apparel design and decoration package. It should not be treated as business registration, a complete fashion collection, or custom cut-and-sew manufacturing. If your project needs pattern development, custom fabric, or a garment made from scratch, describe that first so the studio can confirm whether it can support the work.",
      ],
      bullets: [
        "Start with an idea, sketch, reference, or existing brand artwork.",
        "Agree the garment, method, quantity, print positions, and finishing in a written quote.",
        "Review a mockup and approve the production details before work begins.",
      ],
    },
    {
      title: "Make the first run commercially practical",
      paragraphs: [
        "Begin with the audience, selling price, and quantity you can reasonably move. DTF starts at one piece; screen printing and embroidery start at 24 pieces. A sample can help check artwork and placement, but confirm which method will be used and what it can verify before comparing it with the final run.",
        "For screen printing, setup is charged per colour and the per-piece cost can improve when that setup is spread across more pieces. The goal is a quantity that supports your product and cash flow, not the largest possible order. Ask for a comparison at two or three quantities if that helps you decide.",
      ],
    },
    {
      title: "A clear process for founders based overseas",
      paragraphs: [
        "Allow 2–4 weeks as a project estimate. We will confirm the schedule after reviewing your brief, garment availability, artwork, revisions, finishing, and delivery destination. If you are visiting Bali, confirm the production slot before booking around a flight date.",
        "A 50% deposit starts production, with the balance due on delivery. Confirm the payment details, included revisions, sample costs, delivery, and any exclusions in your quote. For an order shipping outside Bali, include the destination country and date you need the package.",
      ],
      bullets: [
        "Brief: product, customer, quantity, budget range if you are comfortable sharing it, and launch date.",
        "Design: artwork or references, garment, print method, and label or hangtag requirements.",
        "Approval: written scope, sample plan, payment schedule, production timing, and shipping quote.",
      ],
    },
  ],
  faqs: [
    { question: "What does the Brand Starter project include?", answer: "It includes brand and design work with production, custom neck labels and hangtags, with packaging optional. Your written quote will specify the garments, quantity, methods, revisions, and delivery." },
    { question: "How much does the Brand Starter package cost?", answer: "Projects start from IDR 2.5m. This is a starting reference, not a final quote. Share your product, quantity, artwork, finishing, and delivery requirements so we can confirm the total." },
    { question: "Does this include custom garment manufacturing?", answer: "The offer describes apparel design and printing with optional finishing. It does not establish custom cut-and-sew or pattern-making capability. Describe any such requirement and ask the studio to confirm before proceeding." },
    { question: "How long does a Brand Starter project take?", answer: "Allow 2–4 weeks as an estimate. The schedule depends on scope, garment availability, approvals, production capacity, and delivery. We will confirm a start date and milestones in writing." },
    { question: "Can I start with a sample and grow later?", answer: "Yes. Ask us for a sample plan tied to your intended production method. DTF starts at one piece, while screen printing and embroidery start at 24 pieces. We can compare methods and quantities for expected reorders." },
    { question: "Can you ship the finished order overseas?", answer: "Yes, international shipping can be quoted. Share the destination and deadline so we can confirm a courier option, shipping cost, and schedule." },
  ],
  ctaLabel: "Discuss a brand project",
  whatsappMessage: "Hi, I’m planning an apparel brand project with Screenprinting Bali. Product/drop idea: __. Target quantity: __. Artwork or references: __. Labels or finishing needed: __. Target launch date: __. Delivery destination: __. Please confirm whether the project fits your service and what you need to quote it.",
};

export default function ApparelBrandStarterBaliPage() {
  return <ServiceLandingPage data={page} />;
}
