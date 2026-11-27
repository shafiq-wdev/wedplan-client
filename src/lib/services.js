export const SERVICE_STATUSES = ["pending", "published", "rejected"];

export const SERVICE_CATEGORY_META = [
  {
    label: "Photography & Videography",
    slug: "photography-videography",
    blurb: "Timeless photos and cinematic films that capture every emotion.",
  },
  {
    label: "Wedding Venues",
    slug: "wedding-venues",
    blurb: "Ceremony halls, gardens, and retreats for an unforgettable day.",
  },
  {
    label: "Decoration & Florist",
    slug: "decoration-florist",
    blurb: "Floral styling and décor that turn your vision into a setting.",
  },
  {
    label: "Catering Services",
    slug: "catering-services",
    blurb: "Menus, tasting experiences, and service your guests will remember.",
  },
  {
    label: "Makeup & Styling",
    slug: "makeup-styling",
    blurb: "Bridal beauty, hair styling, and finishing touches for the big day.",
  },
  {
    label: "Wedding Fashion",
    slug: "wedding-fashion",
    blurb: "Gowns, suits, and accessories made for your once-in-a-lifetime look.",
  },
];

export const SERVICE_CATEGORIES = SERVICE_CATEGORY_META.map(
  (category) => category.label
);

// Older service documents used shorter category names. Keep them readable and
// filterable while new listings use the six canonical categories above.
const LEGACY_CATEGORY_MAP = {
  Photography: "Photography & Videography",
  Venue: "Wedding Venues",
  Catering: "Catering Services",
  Florals: "Decoration & Florist",
  Makeup: "Makeup & Styling",
  Fashion: "Wedding Fashion",
};

export function normalizeCategory(value) {
  if (typeof value !== "string") return SERVICE_CATEGORIES[0];

  const trimmed = value.trim();

  if (!trimmed) return SERVICE_CATEGORIES[0];
  if (SERVICE_CATEGORIES.includes(trimmed)) return trimmed;

  return LEGACY_CATEGORY_MAP[trimmed] ?? trimmed;
}

export function getCategoryMeta(category) {
  const label = normalizeCategory(category);

  return (
    SERVICE_CATEGORY_META.find((item) => item.label === label) ?? null
  );
}

export function getCategoryBySlug(slug) {
  if (typeof slug !== "string") return null;

  return SERVICE_CATEGORY_META.find((item) => item.slug === slug) ?? null;
}

export function getCategoryQueryValues(category) {
  const label = normalizeCategory(category);

  const legacyValues = Object.entries(LEGACY_CATEGORY_MAP)
    .filter(([, mappedLabel]) => mappedLabel === label)
    .map(([legacyLabel]) => legacyLabel);

  return [label, ...legacyValues];
}

export function normalizeImages(value) {
  const entries = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[\n,]+/)
      : [];

  return entries
    .map((entry) => String(entry).trim())
    .filter((entry) => /^https?:\/\//i.test(entry))
    .slice(0, 8);
}

export function serializeService(service) {
  const category = normalizeCategory(service.category);
  const images = normalizeImages(
    Array.isArray(service.images) && service.images.length > 0
      ? service.images
      : service.image
  );

  return {
    id: service._id.toString(),
    title: service.title || service.serviceName || "",
    serviceName: service.serviceName || service.title || "",
    description: service.description || "",
    category,
    categorySlug: getCategoryMeta(category)?.slug ?? "",
    price: Number(service.price) || 0,
    image: images[0] || "",
    images,
    location: service.location || "",
    vendorName: service.vendorName || "",
    vendorTagline: service.vendorTagline || "",
    vendorId: service.vendorId ? String(service.vendorId) : "",
    status: service.status || "pending",
    isAvailable: service.isAvailable !== false,
    createdAt: service.createdAt
      ? new Date(service.createdAt).toISOString()
      : null,
    updatedAt: service.updatedAt
      ? new Date(service.updatedAt).toISOString()
      : null,
  };
}
