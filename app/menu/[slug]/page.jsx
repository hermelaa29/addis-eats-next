import { fetchDishesServer } from "@/lib/server-dishes";
import { slugify } from "@/lib/dishes";
import DishDetailClient from "./DishDetailClient";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  let dishes = [];
  try {
    dishes = await fetchDishesServer();
  } catch (e) {}
  
  const dish = dishes.find((d) => slugify(d.name) === resolvedParams.slug);
  if (!dish) return { title: "Dish Not Found" };

  return {
    title: dish.name,
    description: dish.description,
    openGraph: {
      title: dish.name,
      description: dish.description,
      images: [dish.image],
    },
    twitter: {
      card: "summary_large_image",
      title: dish.name,
      description: dish.description,
      images: [dish.image],
    }
  };
}

export default async function DishDetailPage({ params }) {
  const resolvedParams = await params;
  let fallbackData = [];
  try {
    fallbackData = await fetchDishesServer();
  } catch (error) {}

  const dish = fallbackData.find((d) => slugify(d.name) === resolvedParams.slug);

  return (
    <>
      {dish && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              name: dish.name,
              image: dish.image,
              description: dish.description,
              offers: {
                "@type": "Offer",
                priceCurrency: "ETB",
                price: dish.price,
                availability: dish.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              },
            }),
          }}
        />
      )}
      <DishDetailClient slug={resolvedParams.slug} fallbackData={fallbackData} />
    </>
  );
}
