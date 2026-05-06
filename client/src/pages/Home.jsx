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
import SEO from '../components/SEO'

export default function Home() {
  return (
    <main style={{ overflowX: 'hidden' }}>
      <SEO 
        title="SWA Wellbeing | Mental Health Healing & Corporate Wellness in Ahmedabad & Gujarat"
        description="Discover SWA Wellbeing's science-backed programs for mental health healing, corporate wellbeing, and emotional resilience in Ahmedabad, Gandhinagar, Surat, Vadodara, Gujarat, and across India."
      />
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
