import { PHOTOS } from "./photos";

export type SitePage = "home" | "generate" | "login" | "signup" | "coming-soon";

export type NavItem = {
  label: string;
  page: SitePage;
  requiresAuth?: boolean;
  comingSoonTitle?: string;
  /** Blank/absent for a top-level item; otherwise the parent's label. */
  parentLabel?: string;
};

export type CardContent = {
  title: string;
  text: string;
  image: string;
  actionLabel?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", page: "home" },
  { label: "Generate Kundali", page: "generate", requiresAuth: true },
  { label: "Match-Making", page: "coming-soon", comingSoonTitle: "Match-Making" },
  { label: "Horoscope", page: "coming-soon", comingSoonTitle: "Horoscope" },
  { label: "Astrology", page: "coming-soon", comingSoonTitle: "Astrology" },
  { label: "Occult", page: "coming-soon", comingSoonTitle: "Occult" },
  { label: "Lal Kitab", page: "coming-soon", comingSoonTitle: "Lal Kitab" },
  { label: "Western Astrology", page: "coming-soon", comingSoonTitle: "Western Astrology" },
  { label: "More 1", page: "coming-soon", comingSoonTitle: "More 1" },
  { label: "More 2", page: "coming-soon", comingSoonTitle: "More 2" },
  { label: "More 3", page: "coming-soon", comingSoonTitle: "More 3" },
  { label: "More 4", page: "coming-soon", comingSoonTitle: "More 4" },
  { label: "More 5", page: "coming-soon", comingSoonTitle: "More 5" }
];


export const HERO_SLIDES: CardContent[] = [
  {
    title: "Birth Chart",
    text: "North India style kundali with precise ascendant and planetary details.",
    image: PHOTOS["brihajjataka"].src
  },
  {
    title: "Match-Making",
    text: "Prepare for compatibility tools, guna matching, and relationship insights.",
    image: PHOTOS["wedding-fire"].src
  },
  {
    title: "Daily Horoscope",
    text: "A dedicated horoscope experience will be connected from this homepage.",
    image: PHOTOS["night-sky"].src
  },
  {
    title: "Lal Kitab",
    text: "Future remedial astrology pages can plug into this navigation.",
    image: PHOTOS["puja-offerings"].src
  },
  {
    title: "Western Astrology",
    text: "Reserve space for tropical charts and western-style interpretations.",
    image: PHOTOS["prague-clock"].src
  }
];

export const SERVICE_CARDS: CardContent[] = [
  {
    title: "Generate Kundali",
    text: "Create an accurate North India birth chart using resolved coordinates and timezone.",
    image: "/images/services/kundali.svg",
    actionLabel: "Open Generator"
  },
  {
    title: "Match-Making",
    text: "A future space for compatibility, guna milan, and marriage guidance.",
    image: "/images/services/match-making.svg"
  },
  {
    title: "Horoscope",
    text: "Daily, weekly, and monthly horoscope pages can be added here.",
    image: "/images/services/horoscope.svg"
  },
  {
    title: "Astrology",
    text: "Build detailed astrology learning, predictions, and consultation pages.",
    image: "/images/services/astrology.svg"
  },
  {
    title: "Occult",
    text: "A dedicated section for numerology, tarot, and occult topics later.",
    image: "/images/services/occult.svg"
  },
  {
    title: "Lal Kitab",
    text: "Remedial astrology with its own house rules, debts, and practical upaya.",
    image: "/images/services/lal-kitab.svg"
  },
  {
    title: "Western Astrology",
    text: "Tropical charts, aspects, and western-style interpretation alongside Vedic.",
    image: "/images/services/western-astrology.svg"
  },
  {
    title: "Panchang",
    text: "Daily tithi, nakshatra, yoga, karana, and muhurat for choosing the right moment.",
    image: "/images/services/panchang.svg"
  }
];

export type Astrologer = {
  name: string;
  avatar: string;
  languages: string[];
  skills: string[];
  rating: number;
  experienceYears: number;
  orders: number;
  pricePerMinute: number;
  trending: boolean;
  online: boolean;
  /** Admin toggles. Optional so the bundled fallback data stays valid. */
  isFree?: boolean;
  chatEnabled?: boolean;
  callEnabled?: boolean;
};


export const ASTROLOGERS: Astrologer[] = [
  {
    name: "Astro Rajneesh",
    avatar: "/images/astrologers/rajneesh.svg",
    languages: ["Hindi", "English", "Punjabi"],
    skills: ["Vedic", "Numerology", "Tarot", "Vastu", "KP", "Prashna"],
    rating: 4.0,
    experienceYears: 5,
    orders: 2045,
    pricePerMinute: 6,
    trending: true,
    online: true
  },
  {
    name: "Astro Uttam",
    avatar: "/images/astrologers/uttam.svg",
    languages: ["Hindi", "English"],
    skills: ["Vedic", "Numerology", "Vastu", "KP", "Prashna"],
    rating: 4.0,
    experienceYears: 5,
    orders: 2965,
    pricePerMinute: 10,
    trending: true,
    online: true
  },
  {
    name: "Astro Vasudha",
    avatar: "/images/astrologers/vasudha.svg",
    languages: ["Hindi", "English"],
    skills: ["Vedic", "Numerology", "Tarot", "Vastu", "KP", "Prashna"],
    rating: 5.0,
    experienceYears: 4,
    orders: 1452,
    pricePerMinute: 12,
    trending: true,
    online: true
  },
  {
    name: "Astro Meera",
    avatar: "/images/astrologers/meera.svg",
    languages: ["Hindi", "Marathi", "English"],
    skills: ["Vedic", "Lal Kitab", "Prashna", "Muhurat"],
    rating: 4.5,
    experienceYears: 9,
    orders: 5310,
    pricePerMinute: 15,
    trending: false,
    online: true
  },
  {
    name: "Astro Kartik",
    avatar: "/images/astrologers/kartik.svg",
    languages: ["Hindi", "English", "Bengali"],
    skills: ["KP", "Vedic", "Vastu", "Numerology"],
    rating: 4.2,
    experienceYears: 7,
    orders: 3188,
    pricePerMinute: 9,
    trending: false,
    online: false
  },
  {
    name: "Astro Sharada",
    avatar: "/images/astrologers/sharada.svg",
    languages: ["Hindi", "Telugu", "English"],
    skills: ["Vedic", "Tarot", "Numerology", "Muhurat", "Prashna"],
    rating: 4.8,
    experienceYears: 12,
    orders: 7642,
    pricePerMinute: 20,
    trending: true,
    online: true
  }
];

export const HOROSCOPE_SIGNS: CardContent[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
].map((sign) => ({
  title: sign,
  text: `${sign} horoscope`,
  image: `/images/zodiac/${sign.toLowerCase()}.svg`
}));

export type FooterLink = {
  label: string;
  /** An app route. When absent the link resolves to /sections/<slug>. */
  route?: string;
};

export type FooterGroup = {
  title: string;
  /** Rendered as two side-by-side columns under one heading. */
  split?: boolean;
  links: FooterLink[];
};

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: "Useful Links",
    split: true,
    links: [
      { label: "Free Kundli", route: "/generate" },
      { label: "Kundli Matching" },
      { label: "Panchang" },
      { label: "Numerology" },
      { label: "Horoscope" },
      { label: "Astrologer Registration" },
      { label: "Vedic" },
      { label: "Tarot" },
      { label: "Yearly Festival Calendar" },
      { label: "Blogs" },
      { label: "Astrologer Login", route: "/login" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About Us" },
      { label: "Contact Us" },
      { label: "Terms & Conditions" },
      { label: "Privacy Policy" },
      { label: "Disclaimer" },
      { label: "Refund & Cancellation Policy" }
    ]
  },
  {
    title: "Horoscope",
    links: [
      { label: "Horoscope 2026" },
      { label: "Yesterday's Horoscope" },
      { label: "Today's Horoscope" },
      { label: "Tomorrow's Horoscope" },
      { label: "Monthly Horoscope" },
      { label: "Yearly Horoscope" }
    ]
  }
];

export const SOCIAL_LINKS = [
  { label: "WhatsApp", href: "https://wa.me/" },
  { label: "Facebook", href: "https://facebook.com/" },
  { label: "LinkedIn", href: "https://linkedin.com/" },
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "YouTube", href: "https://youtube.com/" }
];

/** Every /sections/ slug the footer can produce, so the router does not 404 them. */
export const FOOTER_SECTION_SLUGS = FOOTER_GROUPS.flatMap((group) =>
  group.links
    .filter((link) => !link.route)
    .map((link) =>
      link.label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
);
