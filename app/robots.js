export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/checkout/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/sitemap.xml`,
  };
}
