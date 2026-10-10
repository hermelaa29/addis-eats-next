import { Suspense } from "react";
import MenuClient from "./MenuClient";
import { Spinner } from "@/components/ui/States";
import { fetchDishesServer } from "@/lib/server-dishes";

export const metadata = {
  title: "Menu",
  description: "Explore our Ethiopian dishes and familiar favourites.",
  openGraph: {
    title: "Menu | Addis Eats",
    description: "Explore our Ethiopian dishes and familiar favourites.",
    siteName: "Addis Eats",
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu | Addis Eats",
    description: "Explore our Ethiopian dishes and familiar favourites.",
  }
};

export default async function MenuPage() {
  let fallbackData = [];
  try {
    fallbackData = await fetchDishesServer();
  } catch (error) {
    console.error("Failed to fetch initial menu data", error);
  }

  return (
    <Suspense
      fallback={
        <main className="page">
          <Spinner label="Loading menu" />
        </main>
      }
    >
      <MenuClient fallbackData={fallbackData} />
    </Suspense>
  );
}
