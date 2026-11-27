import { MongoClient } from "mongodb";

// Keep these categories in sync with src/lib/services.js.
const LEGACY_CATEGORY_MAP = {
  Photography: "Photography & Videography",
  Venue: "Wedding Venues",
  Catering: "Catering Services",
  Florals: "Decoration & Florist",
  Makeup: "Makeup & Styling",
  Fashion: "Wedding Fashion",
};

const pexels = (id, width = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

const demoServices = [
  {
    title: "Golden Hour Wedding Photography",
    description:
      "Full-day coverage with a lead photographer, second shooter, and a beautifully edited online gallery delivered within three weeks. Sunset portraits and candid moments included.",
    category: "Photography & Videography",
    price: 1200,
    image: pexels(1024993),
    location: "Cox's Bazar, Bangladesh",
    vendorName: "Lumière Studios",
    vendorTagline: "Editorial wedding photography & films",
    status: "published",
  },
  {
    title: "Cinematic Wedding Films",
    description:
      "A story-first wedding film with two cinematographers, wireless audio, drone coverage, and a three-to-five minute highlight reel plus the full ceremony edit.",
    category: "Photography & Videography",
    price: 950,
    image: pexels(1488315),
    location: "Dhaka, Bangladesh",
    vendorName: "Frame & Vow Films",
    vendorTagline: "Story-first wedding cinematography",
    status: "published",
  },
  {
    title: "Seaside Ceremony Pavilion",
    description:
      "An oceanfront ceremony setting for up to 180 guests, including white draping, aisle florals, seating, sound, and a dedicated on-site coordinator.",
    category: "Wedding Venues",
    price: 3500,
    image: pexels(169198),
    location: "Cox's Bazar, Bangladesh",
    vendorName: "Bluewater Weddings",
    vendorTagline: "Sunset ceremonies by the water",
    status: "published",
  },
  {
    title: "Lakeside Sunset Estate",
    description:
      "A private garden estate with a lakeside ceremony lawn, covered reception pavilion, bridal suite, and parking for 120 guests.",
    category: "Wedding Venues",
    price: 2800,
    image: pexels(931796),
    location: "Sylhet, Bangladesh",
    vendorName: "Rosewood Events",
    vendorTagline: "Garden ceremonies & grand receptions",
    status: "published",
  },
  {
    title: "Romantic Tablescape & Florals",
    description:
      "Complete reception styling with a floral centerpiece collection, candles, table linens, place settings, and a statement entrance arrangement.",
    category: "Decoration & Florist",
    price: 800,
    image: pexels(1045541),
    location: "Dhaka, Bangladesh",
    vendorName: "Bloom & Belle",
    vendorTagline: "Seasonal florals with a romantic touch",
    status: "published",
  },
  {
    title: "Signature Dessert & Catering Bar",
    description:
      "A curated dessert table with cakes, pastries, fresh fruit, and a live mocktail station. Includes setup, styling, and uniformed service staff.",
    category: "Catering Services",
    price: 1500,
    image: pexels(587741),
    location: "Dhaka, Bangladesh",
    vendorName: "Saffron Table",
    vendorTagline: "Multi-course menus & live stations",
    status: "published",
  },
  {
    title: "Bridal Mehndi & Styling",
    description:
      "Traditional bridal mehndi with intricate detailing, matching guest henna for up to five people, and a touch-up session on the wedding morning.",
    category: "Makeup & Styling",
    price: 450,
    image: pexels(1444442),
    location: "Dhaka, Bangladesh",
    vendorName: "Aura Beauty Studio",
    vendorTagline: "Bridal beauty with a personal touch",
    status: "published",
  },
  {
    title: "Soft Glam Bridal Makeup",
    description:
      "A trial session plus wedding-day makeup with long-wear products, lashes, hair styling, and a touch-up kit for the reception.",
    category: "Makeup & Styling",
    price: 550,
    image: pexels(3373746),
    location: "Chattogram, Bangladesh",
    vendorName: "Glow Atelier",
    vendorTagline: "Soft glam for modern brides",
    status: "published",
  },
  {
    title: "Bespoke Bridal Couture",
    description:
      "A made-to-measure bridal gown with two fittings, hand-finished detailing, and a matching veil. Custom suit packages for the groom are available.",
    category: "Wedding Fashion",
    price: 2200,
    image: pexels(265722),
    location: "Dhaka, Bangladesh",
    vendorName: "Ivory Atelier",
    vendorTagline: "Hand-finished gowns & veils",
    status: "published",
  },
];

async function main() {
  const uri = process.env.BETTER_AUTH_DB_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "BETTER_AUTH_DB_URI is not set. Run with `node --env-file=.env scripts/seed-services.mjs`."
    );
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(process.env.BETTER_AUTH_DB_NAME || "wedplandb");
    const services = db.collection("services");
    const now = new Date();

    let created = 0;
    let updated = 0;

    for (const service of demoServices) {
      const existing = await services.findOne({ title: service.title });

      if (existing) {
        await services.updateOne(
          { _id: existing._id },
          { $set: { ...service, updatedAt: now } }
        );
        updated += 1;
      } else {
        await services.insertOne({
          ...service,
          createdAt: now,
          updatedAt: now,
        });
        created += 1;
      }
    }

    let migrated = 0;

    for (const [legacy, category] of Object.entries(LEGACY_CATEGORY_MAP)) {
      const result = await services.updateMany(
        { category: legacy },
        { $set: { category, updatedAt: now } }
      );
      migrated += result.modifiedCount;
    }

    console.log(
      `Seed complete: ${created} created, ${updated} updated, ${migrated} legacy categories migrated.`
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
