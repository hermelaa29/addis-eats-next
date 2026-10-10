import { fetchDishesServer } from "@/lib/server-dishes";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  let fallbackData = [];
  try {
    fallbackData = await fetchDishesServer();
  } catch (error) {
    console.error("Failed to fetch initial home data", error);
  }

  return <HomeClient fallbackData={fallbackData} />;
}
