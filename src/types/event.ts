export type ThemePreset =
  | "brass-luxe"
  | "day-party-summer"
  | "holiday-patriotic"
  | "vip-after-dark";

export type EventMode =
  | "single"
  | "split"
  | "rsvp-only"
  | "paid-vip"
  | "recap";

export interface ScheduleBlock {
  name: string;
  time: string;
  description?: string;
}

export interface HighlightCard {
  icon: string;
  label: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
  type: "image" | "video";
}

export interface EventConfig {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  isoDate: string;
  doorsOpen: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  ageRequirement: string;
  dresscode: string;
  description: string;
  mode: EventMode;
  themePreset: ThemePreset;
  heroImage: string;
  heroVideo?: string;
  overlayOpacity?: number;
  flyerImage?: string;
  gallery: GalleryItem[];
  recapVideo?: string;
  highlights: HighlightCard[];
  schedule: ScheduleBlock[];
  faq: FAQItem[];
  cta: {
    primary: string;
    primaryLink: string;
    secondary?: string;
    secondaryLink?: string;
  };
  showCountdown: boolean;
  showRSVP: boolean;
  showTickets: boolean;
  showVIP: boolean;
  showGallery: boolean;
  showRecap: boolean;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  nextEvent?: {
    title: string;
    date: string;
    link: string;
  };
}
