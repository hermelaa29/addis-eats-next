export function validateRedirect(url, defaultUrl = "/") {
  // Prevent Open Redirects: ensure the URL starts with a single '/'
  // and is not a protocol-relative URL starting with '//'
  if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }
  return defaultUrl;
}
