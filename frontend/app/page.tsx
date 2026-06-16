import { InfiniteGrid } from "@/components/ui/infinite-grid";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { HowItReads } from "@/components/how-it-reads";
import { UploadSection } from "@/components/upload/upload-section";
import { Signals } from "@/components/signals";
import { CTASection } from "@/components/cta-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <InfiniteGrid />
      <SiteHeader />
      <main className="relative z-[2]">
        <Hero />
        <HowItReads />
        <UploadSection />
        <Signals />
        <CTASection />
      </main>
      <SiteFooter />
    </>
  );
}
