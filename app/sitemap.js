import { fetchDishesServer } from "@/lib/server-dishes";
import { slugify } from "@/lib/dishes";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  let dishes = [];
  try {
    dishes = await fetchDishesServer();
  } catch (e) {}

  const dishUrls = dishes.map((dish) => ({
    url: `${baseUrl}/menu/${slugify(dish.name)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...dishUrls,
  ];
}
