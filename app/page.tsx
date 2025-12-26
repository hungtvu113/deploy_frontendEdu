"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { RolesSection } from "@/components/landing/roles-section"
import { CTASection } from "@/components/landing/cta-section"
import { ContactSection } from "@/components/landing/contact-section"
import { SeasonalEffects } from "@/components/seasonal/seasonal-effects"
import { SeasonalProvider, useSeasonalContext } from "@/components/seasonal/seasonal-provider"

function HomeContent() {
  const { event, effectsEnabled } = useSeasonalContext()

  return (
    <div className="min-h-screen">
      {/* Hiệu ứng theo mùa */}
      <SeasonalEffects event={event} enabled={effectsEnabled} />
      
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <RolesSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <SeasonalProvider>
      <HomeContent />
    </SeasonalProvider>
  )
}
