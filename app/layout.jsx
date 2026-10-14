import "./globals.css";
import { Layout } from "@/components/Layout";
import { AppSWRConfig } from "@/lib/swr-cache";
import { DM_Serif_Display, Manrope, DM_Mono } from "next/font/google";

const serif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--serif",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--sans",
});

const mono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--mono",
});

export const metadata = {
  title: {
    template: "%s | Addis Eats",
    default: "Addis Eats | Authentic Ethiopian Food Delivery",
  },
  description:
    "Thoughtful Ethiopian dishes, delivered across Addis. Discover familiar favourites and new rituals made for the way Addis eats today.",
  openGraph: {
    title: "Addis Eats",
    description: "Thoughtful Ethiopian dishes, delivered across Addis.",
    siteName: "Addis Eats",
    images: [
      {
        url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&h=630&q=90",
        width: 1200,
        height: 630,
        alt: "Addis Eats - Authentic Ethiopian Food",
      }
    ],
    locale: "en_ET",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Addis Eats",
    description: "Thoughtful Ethiopian dishes, delivered across Addis.",
    images: ["https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&h=630&q=90"],
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppSWRConfig>
          <Layout>{children}</Layout>
        </AppSWRConfig>
      </body>
    </html>
  );
}
