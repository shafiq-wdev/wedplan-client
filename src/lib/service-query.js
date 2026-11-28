import { getCategoryBySlug, getCategoryQueryValues } from "./services";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const SERVICE_SORT = {
  newest: { createdAt: -1 },
  price_asc: { price: 1, createdAt: -1 },
  price_desc: { price: -1, createdAt: -1 },
};

const KEYWORD_FIELDS = [
  "title",
  "serviceName",
  "description",
  "location",
  "vendorName",
  "vendorTagline",
  "category",
];

export function readQueryValue(value) {
  const text = Array.isArray(value) ? value[0] : value;
  return typeof text === "string" ? text.trim() : "";
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function readPrice(value) {
  const text = readQueryValue(value);

  if (!/^\d+(?:\.\d+)?$/.test(text)) return null;

  const price = Number(text);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

export function getServiceSort(value) {
  const requested = readQueryValue(value);
  return SERVICE_SORT[requested] ?? SERVICE_SORT.newest;
}

export function buildServiceFilter(params = {}) {
  const filter = { status: "published" };

  const requestedCategory = readQueryValue(params.category);
  const activeCategory = getCategoryBySlug(requestedCategory);

  if (activeCategory) {
    const categories = getCategoryQueryValues(activeCategory.label);
    filter.category = categories.length === 1 ? categories[0] : { $in: categories };
  }

  const location = readQueryValue(params.location);
  if (location) filter.location = location;

  const minPrice = readPrice(params.minPrice);
  const maxPrice = readPrice(params.maxPrice);
  const priceFilter = {};

  if (minPrice !== null) priceFilter.$gte = minPrice;
  if (maxPrice !== null) priceFilter.$lte = maxPrice;
  if (Object.keys(priceFilter).length > 0) filter.price = priceFilter;

  const terms = readQueryValue(params.q)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);

  if (terms.length > 0) {
    filter.$and = terms.map((term) => ({
      $or: KEYWORD_FIELDS.map((field) => ({
        [field]: { $regex: escapeRegex(term), $options: "i" },
      })),
    }));
  }

  return filter;
}
