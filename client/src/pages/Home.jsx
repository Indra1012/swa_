import HeroSection from '../sections/HeroSection'
import TaglineSection from '../sections/TaglineSection'
import HealingTechniques from '../sections/HealingTechniques'
import StatsSection from '../sections/StatsSection'
import ServicesSection from '../sections/ServicesSection'
import WhySwaExistsSection from '../sections/WhySwaExistsSection'
import SwaDifferenceSection from '../sections/SwaDifferenceSection'
import MediaGallerySection from '../sections/MediaGallerySection'
import TestimonialsSection from '../sections/TestimonialsSection'
import TransformationModelSection from '../sections/TransformationModelSection'
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
      <TransformationModelSection />
      <WellbeingSection />
      <StatsSection />
      <WhySwaExistsSection />
      <SwaDifferenceSection />
      <MediaGallerySection />
      <CTABanner />
    </main>
  )
}
