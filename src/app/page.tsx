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

export default function Home() {
  return (
    <>
      <Topbar />
      <Hero />
      <StayMove />
      <Paths />
      <Methods />
      <Calculator />
      <Work />
      <Process />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  );
}
