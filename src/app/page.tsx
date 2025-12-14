'use client';

import MegaMenu from '../components/MegaMenu';
import Services from '@/components/Services';
import GoogleEarthSection from '@/components/GoogleEarthSection';
import EmbeddedGallery from '@/components/EmbeddedGallery';
import Address from '@/components/Address';
import Story from '@/components/Story';
import TeamMembers from '@/components/TeamMembers';
import Community from '@/components/Community';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export default function Home() {
  const handleGetStarted = () => {
    console.log('Get Started clicked - Starting user journey!');
    // Add your custom logic here - could be navigation, modal, etc.
  };

  const handleContactUs = () => {
    console.log('Contact Us clicked - Opening contact form!');
    // Add your custom logic here - could be navigation to contact page, modal, etc.
  };

  const handleViewOnEarth = () => {
    console.log('View on Google Earth clicked!');
    // Google Earth will open automatically via the component
  };

  const handleGetDirections = () => {
    console.log('Get Directions clicked!');
    // Google Maps will open automatically via the component
  };

  return (
    <div>
      <MegaMenu
        onCTAClick={handleContactUs}
      />

      <Services />
      <EmbeddedGallery />
      <GoogleEarthSection
        onViewOnEarthClick={handleViewOnEarth}
        onGetDirectionsClick={handleGetDirections}
      />

      <Story />
      <TeamMembers />
      <Community />
      <Testimonials />
      <Address />
      <Footer />
    </div>
  );
}
