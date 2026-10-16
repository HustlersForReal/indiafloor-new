/**
 * Location + service coverage data harvested from SEO.txt (the launch plan).
 *
 * This is the single source of truth for the areas IndiaFloor serves and the
 * floor formats it handles. It drives the on-page coverage copy in
 * components/locations-driven copy and the Organization JSON-LD in seo.ts, so
 * the visible text and the structured data can never drift apart.
 *
 * Deliberately NOT turned into hundreds of thin landing pages — SEO.txt's own
 * launch guidance warns against locality x configuration x type explosion.
 * These are coverage signals on the single indexable page.
 */

/** The 7 NCR markets the forms and map actually serve. */
export const NCR_CITIES = [
  "Delhi",
  "Noida",
  "Greater Noida",
  "Gurugram",
  "Faridabad",
  "Greater Faridabad",
  "Ghaziabad",
] as const;

/** Representative prime localities per city — real, well-known floor markets. */
export const CITY_HIGHLIGHTS: { city: string; localities: string[] }[] = [
  {
    city: "Delhi",
    localities: [
      "Greater Kailash",
      "Defence Colony",
      "Vasant Vihar",
      "Panchsheel Park",
      "Hauz Khas",
      "South Extension",
      "Maharani Bagh",
      "New Friends Colony",
      "Jor Bagh",
      "Golf Links",
      "Dwarka",
      "Rohini",
      "Janakpuri",
      "Punjabi Bagh",
      "Paschim Vihar",
      "Rajouri Garden",
      "Indirapuram",
    ],
  },
  {
    city: "Noida",
    localities: [
      "Sector 15",
      "Sector 44",
      "Sector 50",
      "Sector 62",
      "Sector 93",
      "Sector 104",
      "Sector 128",
      "Sector 137",
      "Sector 150",
    ],
  },
  {
    city: "Greater Noida",
    localities: [
      "Alpha I",
      "Beta I",
      "Gamma I",
      "Delta I",
      "Zeta I",
      "Pari Chowk",
      "Knowledge Park",
      "Omicron I",
      "Greater Noida West",
      "Noida Extension",
      "Gaur City",
    ],
  },
  {
    city: "Gurugram",
    localities: [
      "DLF Phase I–V",
      "Sushant Lok",
      "South City",
      "Golf Course Road",
      "Golf Course Extension Road",
      "Nirvana Country",
      "Palam Vihar",
      "Sector 14",
      "Sector 43–56",
      "Sector 58–95",
    ],
  },
  {
    city: "Faridabad",
    localities: [
      "Sector 14–17",
      "Sector 21",
      "Sector 28–31",
      "Sector 46",
      "Sector 75–85",
      "Greater Faridabad",
      "Neharpar",
    ],
  },
  {
    city: "Ghaziabad",
    localities: [
      "Indirapuram",
      "Vaishali",
      "Vasundhara",
      "Kaushambi",
      "Raj Nagar Extension",
      "Crossings Republik",
      "Siddharth Vihar",
      "Wave City",
    ],
  },
];

/** Floor / property formats handled (SEO.txt section 9). */
export const PROPERTY_FORMATS = [
  "Independent Floors",
  "Builder Floors",
  "Duplexes",
  "Triplexes",
  "Penthouses",
] as const;

/** Configuration options buyers actually search for. */
export const CONFIGURATIONS = [
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "5 BHK+",
] as const;

/** Transaction intents the site serves. */
export const TRANSACTIONS = ["Buy", "Sell", "Rent"] as const;
