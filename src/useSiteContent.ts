import { useSyncExternalStore } from "react";
import { getSiteContent, subscribeToSiteContent } from "./siteContentStore";
import type { FestivalEntry, PlanetaryEventEntry, RashifalEntry } from "./types";
import {
  ASTROLOGERS,
  HERO_SLIDES,
  NAV_ITEMS,
  SERVICE_CARDS,
  type Astrologer,
  type CardContent,
  type NavItem
} from "./siteContent";

type ApiAstrologer = {
  name: string;
  avatarUrl: string;
  languages: string[];
  skills: string[];
  rating: number;
  experienceYears: number;
  orders: number;
  pricePerMinute: number;
  isFree: boolean;
  chatEnabled: boolean;
  callEnabled: boolean;
  trending: boolean;
  online: boolean;
};

type ApiCard = { title: string; text: string; imageUrl: string; actionLabel?: string };
type ApiNavItem = {
  label: string;
  page: string;
  comingSoonTitle: string;
  requiresAuth: boolean;
  parentLabel?: string;
};
type ApiText = { key: string; value: string };
type ApiZodiacOverride = {
  slug: string;
  tagline: string;
  personality: string;
  career: string;
  relationships: string;
  health: string;
  finance: string;
};

export type ApiSiteContent = {
  astrologers: ApiAstrologer[];
  services: ApiCard[];
  heroSlides: ApiCard[];
  navItems: ApiNavItem[];
  texts: ApiText[];
  zodiacOverrides: ApiZodiacOverride[];
  festivals: FestivalEntry[];
  planetaryEvents: PlanetaryEventEntry[];
  rashifal: RashifalEntry[];
};

/** The prose fields an admin may override. The derived facts are not here on
 *  purpose: lord, element, quality and nakshatras come from the chart tables. */
export type ZodiacOverride = ApiZodiacOverride;

export type SiteContentState = {
  astrologers: Astrologer[];
  services: CardContent[];
  heroSlides: CardContent[];
  navItems: NavItem[];
  text: (key: string, fallback: string) => string;
  zodiacOverride: (slug: string) => Partial<ZodiacOverride> | undefined;
  festivals: FestivalEntry[];
  planetaryEvents: PlanetaryEventEntry[];
  rashifal: RashifalEntry[];
  /** True once a real response has been applied; false while showing built-in content. */
  fromApi: boolean;
};

/**
 * Site content comes from the admin panel, with the bundled data as a fallback.
 *
 * The fallback matters: if the API is unreachable, or an admin has emptied a
 * section, the page still renders something rather than collapsing to blank.
 *
 * The content itself lives in a shared store rather than in this hook, so every
 * consumer sees the same copy and an admin edit reaches the page without a
 * browser reload. See ./siteContentStore.
 */
export function useSiteContent(): SiteContentState {
  const content = useSyncExternalStore(subscribeToSiteContent, getSiteContent, getSiteContent);

  const apiAstrologers = content?.astrologers ?? [];
  const apiServices = content?.services ?? [];
  const apiSlides = content?.heroSlides ?? [];
  const apiNav = content?.navItems ?? [];

  const textMap = new Map((content?.texts ?? []).map((entry) => [entry.key, entry.value]));

  return {
    astrologers:
      apiAstrologers.length > 0
        ? apiAstrologers.map((item, index) => ({
            name: item.name,
            // Admins may leave the photo blank; reuse a bundled placeholder so the
            // card keeps its shape.
            avatar: item.avatarUrl || ASTROLOGERS[index % ASTROLOGERS.length].avatar,
            languages: item.languages,
            skills: item.skills,
            rating: item.rating,
            experienceYears: item.experienceYears,
            orders: item.orders,
            pricePerMinute: item.pricePerMinute,
            isFree: item.isFree,
            chatEnabled: item.chatEnabled,
            callEnabled: item.callEnabled,
            trending: item.trending,
            online: item.online
          }))
        : ASTROLOGERS,
    services:
      apiServices.length > 0
        ? apiServices.map((item, index) => ({
            title: item.title,
            text: item.text,
            image: item.imageUrl || SERVICE_CARDS[index % SERVICE_CARDS.length].image,
            actionLabel: item.actionLabel
          }))
        : SERVICE_CARDS,
    heroSlides:
      apiSlides.length > 0
        ? apiSlides.map((item, index) => ({
            title: item.title,
            text: item.text,
            image: item.imageUrl || HERO_SLIDES[index % HERO_SLIDES.length].image
          }))
        : HERO_SLIDES,
    navItems:
      apiNav.length > 0
        ? apiNav.map((item) => ({
            label: item.label,
            page: item.page as NavItem["page"],
            comingSoonTitle: item.comingSoonTitle || undefined,
            requiresAuth: item.requiresAuth,
            parentLabel: item.parentLabel || undefined
          }))
        : NAV_ITEMS,
    text: (key, fallback) => textMap.get(key) || fallback,
    zodiacOverride: (slug) =>
      (content?.zodiacOverrides ?? []).find((entry) => entry.slug === slug),
    festivals: content?.festivals ?? [],
    planetaryEvents: content?.planetaryEvents ?? [],
    rashifal: content?.rashifal ?? [],
    fromApi: content !== null
  };
}
