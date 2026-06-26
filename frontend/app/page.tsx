import { InfiniteGrid } from "@/components/ui/infinite-grid";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { StorySection } from "@/components/story-section";
import { XenrexCinematicSection } from "@/components/ui/cinematic-landing-hero";
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
        <StorySection />
        <XenrexCinematicSection
          tagline="Read minds."
          subTagline="Before they scroll away."
        />
        <UploadSection />
        <Signals />
        <CTASection />
      </main>
      <SiteFooter />
    </>
  );
}
