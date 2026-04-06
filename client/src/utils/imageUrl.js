/**
 * Injects Cloudinary transformations into a Cloudinary URL.
 * Non-Cloudinary URLs are returned unchanged.
 *
 * Transforms applied: w_{width}, q_auto (smart compression), f_auto (WebP/AVIF if browser supports)
 */
export function cloudinaryImg(url, width = 800) {
  if (!url || !url.includes('res.cloudinary.com')) return url
  // Don't double-transform if already has transforms
  if (/\/upload\/[a-z]/.test(url)) return url
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`)
}
