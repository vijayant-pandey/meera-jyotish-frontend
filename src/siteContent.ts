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
          <stop offset="0%" stop-color="#fff5de" stop-opacity="0.88"/>
          <stop offset="100%" stop-color="#fff5de" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="900" height="460" fill="url(#bg)"/>
      <rect width="900" height="460" fill="url(#glow)"/>
      <circle cx="720" cy="105" r="82" fill="#fff3d5" opacity="0.25"/>
      <circle cx="760" cy="360" r="150" fill="#3b1b10" opacity="0.16"/>
      <path d="M90 360 L220 190 L350 360 Z" fill="none" stroke="#fff8ea" stroke-width="5" opacity="0.42"/>
      <path d="M550 360 L680 190 L810 360 Z" fill="none" stroke="#fff8ea" stroke-width="5" opacity="0.35"/>
      <text x="70" y="205" font-family="Georgia, serif" font-size="64" font-weight="700" fill="#fff8ea">${title}</text>
      <text x="74" y="260" font-family="Georgia, serif" font-size="25" fill="#fff8ea" opacity="0.86">${subtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const HERO_SLIDES: CardContent[] = [
  {
    title: "Birth Chart",
    text: "North India style kundali with precise ascendant and planetary details.",
    image: svgImage("Birth Chart", "Know your planetary blueprint", "#8d4128", "#d19a48")
  },
  {
    title: "Match-Making",
    text: "Prepare for compatibility tools, guna matching, and relationship insights.",
    image: svgImage("Match-Making", "Compatibility insights coming soon", "#6b351e", "#bd6b38")
  },
  {
    title: "Daily Horoscope",
    text: "A dedicated horoscope experience will be connected from this homepage.",
    image: svgImage("Horoscope", "Twelve signs, one cosmic story", "#4d3825", "#c08d52")
  },
  {
    title: "Lal Kitab",
    text: "Future remedial astrology pages can plug into this navigation.",
    image: svgImage("Lal Kitab", "Remedies and guidance coming soon", "#76301d", "#c79a62")
  },
  {
    title: "Western Astrology",
    text: "Reserve space for tropical charts and western-style interpretations.",
    image: svgImage("Western", "A new astrology section for later", "#59341f", "#a86438")
  }
];

export const SERVICE_CARDS: CardContent[] = [
  {
    title: "Generate Kundali",
    text: "Create an accurate North India birth chart using resolved coordinates and timezone.",
    image: svgImage("Kundali", "D1 to D60 varga chart support", "#8d4128", "#c5803d"),
    actionLabel: "Open Generator"
  },
  {
    title: "Match-Making",
    text: "A future space for compatibility, guna milan, and marriage guidance.",
    image: svgImage("Match", "Compatibility tools", "#6a321c", "#bb7543")
  },
  {
    title: "Horoscope",
    text: "Daily, weekly, and monthly horoscope pages can be added here.",
    image: svgImage("Signs", "Zodiac guidance", "#5b3a24", "#c59857")
  },
  {
    title: "Astrology",
    text: "Build detailed astrology learning, predictions, and consultation pages.",
    image: svgImage("Astrology", "Planetary wisdom", "#7f3b27", "#c2854b")
  },
  {
    title: "Occult",
    text: "A dedicated section for numerology, tarot, and occult topics later.",
    image: svgImage("Occult", "Mystic studies", "#432d22", "#9b6740")
  }
];

export const ASTROLOGER_CARDS: CardContent[] = Array.from({ length: 10 }, (_, index) => ({
  title: `Astrologer ${index + 1}`,
  text: "Profile, expertise, rating, and booking link can be connected here later.",
  image: svgImage(`Astro ${index + 1}`, "Expert profile placeholder", "#744027", "#d2a05d"),
  actionLabel: "View Profile"
}));

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
  image: svgImage(sign, "Click to open later", "#6d3b25", "#c28a4b")
}));
