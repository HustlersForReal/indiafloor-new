import BuyerPreferencesSection from "../components/BuyerPreferencesSection";
import ContactFabs from "../components/ContactFabs";
import FAQSection from "../components/FAQSection";
import PropertyVivaadFooter from "../components/PropertyVivaadFooter";
import Header from "../components/Header";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import SellerSection from "../components/SellerSection";
import Tiers from "../components/Tiers";
import WhyIndiaFloor from "../components/WhyIndiaFloor";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <WhyIndiaFloor />
        <Tiers />
        <HowItWorks />
        <BuyerPreferencesSection />
        <SellerSection />
        <FAQSection />
      </main>
      <PropertyVivaadFooter />
      <ContactFabs />
    </div>
  );
}
