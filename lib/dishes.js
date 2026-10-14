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

// In-memory runtime cache map for fast client retrievals
const memoryCache = new Map();

/**
 * Robust cached fetcher with Memory + localStorage layers.
 * Guarantees that once fetched, data is saved in cache and always reloaded from it,
 * preventing redundant network requests.
 */
export const fetcher = async (url) => {
  // 1. Check in-memory cache
  if (memoryCache.has(url)) {
    return memoryCache.get(url);
  }

  // 2. Check localStorage persistent cache
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`addis-eats-cache:${url}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (!Array.isArray(parsed) || parsed.length > 0)) {
          memoryCache.set(url, parsed);
          return parsed;
        }
      }
    } catch (e) {
      // Storage access or parse error
    }
  }

  // 3. Network fetch with browser cache preference
  const res = await fetch(url, {
    cache: "force-cache",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error('We could not load the data.');
  }

  const data = await res.json();

  // 4. Save to in-memory cache
  memoryCache.set(url, data);

  // 5. Save to localStorage persistent cache
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`addis-eats-cache:${url}`, JSON.stringify(data));
    } catch (e) {
      // Handle storage quota limit
    }
  }

  return data;
};

export const categories = ['All', 'Ethiopian', 'Pizza', 'Burgers', 'Drinks'];
