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
        <section className="w-full bg-white px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <div className="mx-auto w-full max-w-[1400px] text-center">
            <h2 className="text-[28px] font-extrabold tracking-tight text-navy-900 sm:text-[36px]">
              The Door To Every Property Floor
            </h2>
            <p className="mx-auto mt-4 max-w-[900px] rounded-xl bg-navy-900/8 px-4 py-3 text-[15px] font-semibold leading-relaxed text-navy-900 sm:text-[17px]">
              From residential floor to a commercial office floor, from an apartment to a penthouse, from a builder floor to an owner constructed floor, we are - The Door To Every Property Floor.
            </p>
          </div>
        </section>
        <BuyerPreferencesSection />
        <SellerSection />
        <FAQSection />
      </main>
      <PropertyVivaadFooter />
      <ContactFabs />
    </div>
  );
}
