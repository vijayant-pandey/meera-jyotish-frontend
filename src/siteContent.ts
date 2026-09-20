export type SitePage = "home" | "generate" | "login" | "signup" | "coming-soon";

export type NavItem = {
  label: string;
  page: SitePage;
  requiresAuth?: boolean;
  comingSoonTitle?: string;
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

function svgImage(title: string, subtitle: string, from: string, to: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 460">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${from}"/>
          <stop offset="100%" stop-color="${to}"/>
        </linearGradient>
        <radialGradient id="glow" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stop-color="#fff8e0" stop-opacity="0.88"/>
          <stop offset="100%" stop-color="#fff8e0" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="900" height="460" fill="url(#bg)"/>
      <rect width="900" height="460" fill="url(#glow)"/>
      <circle cx="720" cy="105" r="82" fill="#ffeec2" opacity="0.25"/>
      <circle cx="760" cy="360" r="150" fill="#5c0d0d" opacity="0.16"/>
      <path d="M90 360 L220 190 L350 360 Z" fill="none" stroke="#fffdf2" stroke-width="5" opacity="0.42"/>
      <path d="M550 360 L680 190 L810 360 Z" fill="none" stroke="#fffdf2" stroke-width="5" opacity="0.35"/>
      <text x="70" y="205" font-family="Georgia, serif" font-size="64" font-weight="700" fill="#fffdf2">${title}</text>
      <text x="74" y="260" font-family="Georgia, serif" font-size="25" fill="#fffdf2" opacity="0.86">${subtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const HERO_SLIDES: CardContent[] = [
  {
    title: "Birth Chart",
    text: "North India style kundali with precise ascendant and planetary details.",
    image: svgImage("Birth Chart", "Know your planetary blueprint", "#a81c1c", "#f5b731")
  },
  {
    title: "Match-Making",
    text: "Prepare for compatibility tools, guna matching, and relationship insights.",
    image: svgImage("Match-Making", "Compatibility insights coming soon", "#8e1616", "#ef8a2a")
  },
  {
    title: "Daily Horoscope",
    text: "A dedicated horoscope experience will be connected from this homepage.",
    image: svgImage("Horoscope", "Twelve signs, one cosmic story", "#7a1212", "#f3ad3e")
  },
  {
    title: "Lal Kitab",
    text: "Future remedial astrology pages can plug into this navigation.",
    image: svgImage("Lal Kitab", "Remedies and guidance coming soon", "#9b1a1a", "#f6bc55")
  },
  {
    title: "Western Astrology",
    text: "Reserve space for tropical charts and western-style interpretations.",
    image: svgImage("Western", "A new astrology section for later", "#8a1515", "#e87a2c")
  }
];

export const SERVICE_CARDS: CardContent[] = [
  {
    title: "Generate Kundali",
    text: "Create an accurate North India birth chart using resolved coordinates and timezone.",
    image: svgImage("Kundali", "D1 to D60 varga chart support", "#a81c1c", "#f2a134"),
    actionLabel: "Open Generator"
  },
  {
    title: "Match-Making",
    text: "A future space for compatibility, guna milan, and marriage guidance.",
    image: svgImage("Match", "Compatibility tools", "#93191a", "#ee8f38")
  },
  {
    title: "Horoscope",
    text: "Daily, weekly, and monthly horoscope pages can be added here.",
    image: svgImage("Signs", "Zodiac guidance", "#801414", "#f4b544")
  },
  {
    title: "Astrology",
    text: "Build detailed astrology learning, predictions, and consultation pages.",
    image: svgImage("Astrology", "Planetary wisdom", "#a02020", "#f0a03a")
  },
  {
    title: "Occult",
    text: "A dedicated section for numerology, tarot, and occult topics later.",
    image: svgImage("Occult", "Mystic studies", "#6d1010", "#db8330")
  },
  {
    title: "Lal Kitab",
    text: "Remedial astrology with its own house rules, debts, and practical upaya.",
    image: svgImage("Lal Kitab", "Remedies and upaya", "#9b1a1a", "#f6bc55")
  },
  {
    title: "Western Astrology",
    text: "Tropical charts, aspects, and western-style interpretation alongside Vedic.",
    image: svgImage("Western", "Tropical charts", "#8a1515", "#e87a2c")
  },
  {
    title: "Panchang",
    text: "Daily tithi, nakshatra, yoga, karana, and muhurat for choosing the right moment.",
    image: svgImage("Panchang", "Tithi and muhurat", "#a02020", "#f2a134")
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
};

/** Square portrait placeholder with the astrologer's initials. */
function avatarImage(initials: string, from: string, to: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="a" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${from}"/>
          <stop offset="100%" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#a)"/>
      <circle cx="100" cy="78" r="34" fill="#fffdf2" opacity="0.9"/>
      <path d="M40 200 C40 150 70 126 100 126 C130 126 160 150 160 200 Z" fill="#fffdf2" opacity="0.9"/>
      <text x="100" y="188" text-anchor="middle" font-family="Georgia, serif" font-size="26" font-weight="700" fill="${from}">${initials}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const ASTROLOGERS: Astrologer[] = [
  {
    name: "Astro Rajneesh",
    avatar: avatarImage("AR", "#a81c1c", "#f5b731"),
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
    avatar: avatarImage("AU", "#8e1616", "#ef8a2a"),
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
    avatar: avatarImage("AV", "#9b1a1a", "#f6bc55"),
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
    avatar: avatarImage("AM", "#7a1212", "#f3ad3e"),
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
    avatar: avatarImage("AK", "#a02020", "#f2a134"),
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
    avatar: avatarImage("AS", "#93191a", "#f4b544"),
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
  image: svgImage(sign, "Click to open later", "#8a1a18", "#f1a73c")
}));
