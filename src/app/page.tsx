import Topbar from "@/components/Topbar";
import Hero from "@/components/Hero";
import StayMove from "@/components/StayMove";
import Paths from "@/components/Paths";
import Methods from "@/components/Methods";
import Calculator from "@/components/Calculator";
import Work from "@/components/Work";
import Process from "@/components/Process";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Topbar />
      <Hero />
      <Reveal>
        <StayMove />
      </Reveal>
      <Reveal>
        <Paths />
      </Reveal>
      <Reveal>
        <Methods />
      </Reveal>
      <Reveal>
        <Calculator />
      </Reveal>
      <Reveal>
        <Work />
      </Reveal>
      <Reveal>
        <Process />
      </Reveal>
      <Reveal>
        <Pricing />
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
      <Reveal>
        <FinalCta />
      </Reveal>
      <Footer />
    </>
  );
}
