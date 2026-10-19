/**
 * The FAQ copy, shared by the visible accordion (components/FAQSection) and
 * the FAQPage JSON-LD in app/layout.tsx. One source so the schema can never
 * drift from what users actually read on the page.
 *
 * Keep answers factual and in sync with the rest of the site's copy — these
 * feed a search-engine rich result.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: "What is India Floor?",
    a: "India Floor is a floor-property discovery platform that combines inventory discovery with personalised assistance to help customers find suitable properties for buying or renting.",
  },
  {
    q: "Which property categories are covered?",
    a: "Depending on available inventory, India Floor may cover residential floors, farmhouse floors, penthouses, commercial floors, industrial floors, institutional floors and other eligible floor-based properties.",
  },
  {
    q: "Are duplexes and triplexes separate property categories?",
    a: "They are configurations. A suitable property may be single-level, duplex, triplex or another configuration, depending on its structure and permitted use.",
  },
  {
    q: "How do Silver, Gold and Diamond work?",
    a: "They classify properties according to asking sale price or monthly rental value, not service quality.\n\nSale:\nSilver: Below ₹2 crore.\nGold: ₹2 crore to below ₹10 crore.\nDiamond: ₹10 crore and above.\n\nRent:\nSilver: Below ₹2 lakh per month.\nGold: ₹2 lakh to below ₹10 lakh per month.\nDiamond: ₹10 lakh per month and above.",
  },
  {
    q: "Do all tiers receive the same service?",
    a: "Yes. Silver, Gold and Diamond are value classifications, not service packages.",
  },
  {
    q: "Do buyers pay India Floor anything?",
    a: "No. Buyers pay India Floor nothing for its defined services. India Floor does not charge buyers brokerage, service charges or a success fee.",
  },
  {
    q: "Do tenants pay India Floor anything?",
    a: "No. Tenants pay India Floor nothing for its defined services. India Floor does not charge tenants brokerage, service charges or a success fee.",
  },
  {
    q: "How does India Floor earn revenue?",
    a: "India Floor earns through agreed commercial arrangements with participating property providers. These may include commissions on qualifying transactions or other separately agreed services.",
  },
  {
    q: "How are rental commissions decided?",
    a: "Rental commercial terms are agreed separately in writing before engagement.",
  },
  {
    q: "What happens after I submit a requirement?",
    a: "India Floor reviews the information provided and helps identify relevant options from available inventory. If a suitable property is available, the team may coordinate a viewing or meeting, subject to confirmation.",
  },
  {
    q: "Are properties legally verified by India Floor?",
    a: "Yes for our concierge services all the property floors are 100% Verified and give a Zero Fake Listing And A Zero Fraud Transactional Guarantee.",
  },
  {
    q: "Can I list my property?",
    a: "Builders, sellers, owners and landlords can submit eligible property details for consideration. Marketing is subject to appropriate authorisation and agreed terms.",
  },
  {
    q: "Does India Floor list every property in India?",
    a: "No. India Floor works with inventory onboarded through its process. Availability depends on location, budget and current inventory.",
  },
  {
    q: "Is India Floor available nationwide?",
    a: "India Floor has a national vision, with inventory and local coordination introduced city by city. Please confirm availability in your preferred location.",
  },
  {
    q: "Does the zero-fee promise cover government or third-party charges?",
    a: "No. The promise covers India Floor's own defined services. Government duties, registration expenses and separately payable third-party costs remain subject to applicable law and the relevant service arrangements.",
  },
  {
    q: "Can I contact India Floor for another property requirement?",
    a: "Yes definitely, India Floor works in association with our dedicated and wider buyer platform - thebuyer.in and a even wider property baap ecosystem. You can freely reach us for any property requirements which will further be transferred to the dedicated section of our property ecosystem.",
  },
];
