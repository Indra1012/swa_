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
import FAQSection from '../sections/FAQSection'

export default function Home() {
  return (
    <main style={{ overflowX: 'hidden' }}>
      <HeroSection />
      <TaglineSection />
      <HealingTechniques />
      <StatsSection />
      <ServicesSection />
      <WhyUsSection />
      <MediaGallerySection />
      <TestimonialsSection />
      <WellbeingSection />
      <CTABanner />
      <FAQSection />
    </main>
  )
}
