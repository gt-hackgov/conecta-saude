import { AuthCard } from "@/components/auth/AuthCard";
import { HeroSection } from "@/components/home/HeroSection";
import { LandingBackground } from "@/components/home/LandingBackground";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { LandingHeader } from "@/components/layout/LandingHeader";

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden font-sans">
      <LandingBackground />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 lg:px-10">
        <LandingHeader />

        <main className="grid flex-1 items-center gap-12 py-8 lg:grid-cols-[1.05fr_minmax(0,25rem)] lg:gap-16 lg:py-12">
          <HeroSection />

          <div className="flex justify-center lg:justify-end">
            <AuthCard />
          </div>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}
