import { InfiniteGrid } from "@/components/ui/infinite-grid";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { StorySection } from "@/components/story-section";
import { XenrexReadSection } from "@/components/read-section";
import { UploadSection } from "@/components/upload/upload-section";
import { Signals } from "@/components/signals";
import { CTASection } from "@/components/cta-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <div className="bg-black min-h-screen">
      <InfiniteGrid />
      <SiteHeader />
      <main className="relative z-[2]">
        <Hero />
        <StorySection />
        <XenrexReadSection />
        <UploadSection />
        <Signals />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
