import type { ContentKind } from "../adminApi";

export type FieldSpec = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "image" | "list";
  help?: string;
  min?: number;
  max?: number;
  step?: number;
  /** Settable when creating, locked afterwards. Used for identifiers the page
   *  binds to: renaming one silently disconnects the text from the site. */
  lockedAfterCreate?: boolean;
};

export type ContentSpec = {
  kind: ContentKind;
  title: string;
  description: string;
  /** Field used as the row heading in the list. */
  titleField: string;
  fields: FieldSpec[];
};

// Every row also has `published` and `position`, appended below so each spec
// stays focused on what makes that content type distinct.
const COMMON: FieldSpec[] = [
  {
    name: "published",
    label: "Published",
    type: "boolean",
    help: "Unpublished rows are filtered out server-side and never reach a visitor."
  },
  { name: "position", label: "Sort order", type: "number", min: 0, help: "Lower numbers appear first." }
];

const SPECS: ContentSpec[] = [
  {
    kind: "astrologers",
    title: "Astrologers",
    description: "Profiles shown in the Our Astrologers carousel on the home page.",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "avatarUrl", label: "Photo", type: "image" },
      { name: "languages", label: "Languages", type: "list", help: "Comma separated." },
      { name: "skills", label: "Skill tags", type: "list", help: "Vedic, Numerology, Tarot, ..." },
      { name: "rating", label: "Star rating", type: "number", min: 0, max: 5, step: 0.1 },
      { name: "experienceYears", label: "Experience (years)", type: "number", min: 0, max: 100 },
      { name: "orders", label: "Orders", type: "number", min: 0 },
      { name: "pricePerMinute", label: "Price per minute (Rs)", type: "number", min: 0 },
      { name: "isFree", label: "Show as Free", type: "boolean", help: "Strikes through the price and shows Free." },
      { name: "chatEnabled", label: "Chat button", type: "boolean" },
      { name: "callEnabled", label: "Call button", type: "boolean" },
      { name: "trending", label: "Trending ribbon", type: "boolean" },
      { name: "online", label: "Online now", type: "boolean" },
      ...COMMON
    ]
  },
  {
    kind: "services",
    title: "Service cards",
    description: "The auto-scrolling Our Services row.",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "text", label: "Description", type: "textarea" },
      { name: "imageUrl", label: "Image", type: "image" },
      { name: "actionLabel", label: "Button label", type: "text" },
      {
        name: "targetRoute",
        label: "Links to",
        type: "text",
        help: "A path such as /generate. Leave blank to show the Coming Soon page."
      },
      ...COMMON
    ]
  },
  {
    kind: "hero-slides",
    title: "Hero slides",
    description: "The rotating banner at the top of the home page.",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "text", label: "Caption", type: "textarea" },
      { name: "imageUrl", label: "Image", type: "image" },
      ...COMMON
    ]
  },
  {
    kind: "nav-items",
    title: "Navigation",
    description: "Items in the main navigation bar.",
    titleField: "label",
    fields: [
      { name: "label", label: "Label", type: "text" },
      {
        name: "page",
        label: "Page",
        type: "text",
        help: "home, generate, login, signup, or coming-soon."
      },
      { name: "comingSoonTitle", label: "Coming-soon title", type: "text" },
      {
        name: "parentLabel",
        label: "Sits under",
        type: "text",
        help: "Leave blank for a top-level item. Type a parent's exact label (e.g. Astronomy) to make this a dropdown entry under it."
      },
      { name: "requiresAuth", label: "Requires sign-in", type: "boolean" },
      ...COMMON
    ]
  },
  {
    kind: "texts",
    title: "Page text",
    description: "Headings and copy addressed by a stable key.",
    titleField: "label",
    fields: [
      {
        name: "key",
        label: "Key",
        type: "text",
        lockedAfterCreate: true,
        help: "The page looks the text up by this key. It cannot be changed once created, because renaming it would disconnect the text from the page."
      },
      { name: "label", label: "Where it appears", type: "text" },
      { name: "value", label: "Text", type: "textarea" },
      ...COMMON
    ]
  },
  {
    kind: "zodiac",
    title: "Zodiac copy",
    description:
      "Overrides for the rashi pages. Anything left blank falls back to the built-in text, and the derived facts (lord, element, nakshatras) are never editable because the charts depend on them.",
    titleField: "slug",
    fields: [
      {
        name: "slug",
        label: "Rashi slug",
        type: "text",
        lockedAfterCreate: true,
        help: "Which rashi page this overrides. Locked after creation."
      },
      { name: "tagline", label: "Tagline", type: "textarea" },
      { name: "personality", label: "Personality", type: "textarea" },
      { name: "career", label: "Career", type: "textarea" },
      { name: "relationships", label: "Relationships", type: "textarea" },
      { name: "health", label: "Health", type: "textarea" },
      { name: "finance", label: "Finance", type: "textarea" },
      ...COMMON
    ]
  },
  {
    kind: "festivals",
    title: "Festivals",
    description: "Upcoming Upavas and Festivals on the home page. Dates are entered by hand for now; a rules engine keyed to tithi, nakshatra and month can replace them later without changing this screen.",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "occursOn", label: "Date", type: "text", help: "YYYY-MM-DD, e.g. 2026-09-23" },
      { name: "imageUrl", label: "Image", type: "image" },
      { name: "note", label: "Note", type: "textarea" },
      ...COMMON
    ]
  },
  {
    kind: "planetary-events",
    title: "Planetary Events",
    description: "Upcoming transits, ingresses and aspects.",
    titleField: "title",
    fields: [
      { name: "title", label: "Event", type: "text" },
      { name: "occursAt", label: "When", type: "text", help: "YYYY-MM-DDTHH:MM, e.g. 2026-09-24T05:50" },
      { name: "note", label: "Note", type: "textarea" },
      ...COMMON
    ]
  },
  {
    kind: "rashifal",
    title: "Rashifal",
    description: "The daily horoscope paragraph for each rashi. Change these each day.",
    titleField: "sign",
    fields: [
      { name: "sign", label: "Rashi", type: "text", help: "Mesha, Vrishabha, Mithuna, ..." },
      { name: "text", label: "Prediction", type: "textarea" },
      { name: "imageUrl", label: "Image", type: "image" },
      ...COMMON
    ]
  },
  {
    kind: "subscribers",
    title: "Subscribers",
    description: "Email addresses collected by the footer subscribe box. Collected from visitors rather than authored, so these are listed and deleted here, not written.",
    titleField: "email",
    fields: [{ name: "email", label: "Email", type: "text", lockedAfterCreate: true }]
  },
  {
    kind: "feedback",
    title: "Feedback",
    description: "Messages sent through the footer feedback box.",
    titleField: "message",
    fields: [
      { name: "message", label: "Message", type: "textarea" },
      { name: "email", label: "From", type: "text" }
    ]
  }
];

export const CONTENT_SPECS = SPECS;

export function specFor(kind: ContentKind): ContentSpec {
  const spec = SPECS.find((item) => item.kind === kind);
  if (!spec) {
    throw new Error(`No admin spec for content type '${kind}'`);
  }
  return spec;
}

/** A blank row shaped by the spec, so a new item starts with valid types. */
export function emptyRow(spec: ContentSpec): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const field of spec.fields) {
    if (field.type === "boolean") {
      row[field.name] = field.name === "published" ? true : false;
    } else if (field.type === "number") {
      row[field.name] = 0;
    } else if (field.type === "list") {
      row[field.name] = [];
    } else {
      row[field.name] = "";
    }
  }
  return row;
}
