import HeroSection from '../sections/HeroSection'
import TaglineSection from '../sections/TaglineSection'
import HealingTechniques from '../sections/HealingTechniques'
import StatsSection from '../sections/StatsSection'
import ServicesSection from '../sections/ServicesSection'
import WhyUsSection from '../sections/WhyUsSection'
import MediaGallerySection from '../sections/MediaGallerySection'
import TestimonialsSection from '../sections/TestimonialsSection'
import WellbeingSection from '../sections/WellbeingSection'
import CTABanner from '../sections/CTABanner'

export default function Home() {
  return (
    <main style={{ overflowX: 'hidden' }}>
      <HeroSection />
      <TaglineSection />
      <ServicesSection />
      <HealingTechniques />
      <TestimonialsSection />
      <WellbeingSection />
      <StatsSection />
      <WhyUsSection />
      <MediaGallerySection />
      <CTABanner />
    </main>
  )
}
