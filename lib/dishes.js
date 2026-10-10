/** Convert a dish name to a URL-safe slug: "Beyaynetu Platter" → "beyaynetu-platter" */
export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Reverse a slug back to an ID by looking it up in the dishes list */
export function dishBySlug(dishes, slug) {
  return dishes.find((d) => slugify(d.name) === slug) || null;
}

export const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('We could not load the data.');
  return res.json();
});

export const categories = ['All', 'Ethiopian', 'Pizza', 'Burgers', 'Drinks'];
