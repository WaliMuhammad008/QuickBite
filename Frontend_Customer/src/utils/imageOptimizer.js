import { API_BASE } from "../config/api";

/**
 * Optimizes a Cloudinary image URL by injecting quality, format, and width parameters.
 * If the URL is not a valid Cloudinary upload URL, it returns the original URL.
 * 
 * @param {string} url - The original image URL
 * @param {number} width - The desired width in pixels (e.g., 600)
 * @returns {string} - The optimized Cloudinary URL
 */
export const optimizeCloudinaryImage = (url, width = 600) => {
  if (!url || typeof url !== 'string') return url;

  // Check if it's a Cloudinary URL
  if (url.includes('res.cloudinary.com')) {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      // Inject transformation parameters: scale crop, specific width, auto quality, auto format
      const transformation = `/c_scale,w_${width},q_auto,f_auto`;
      return url.slice(0, uploadIndex + 7) + transformation + url.slice(uploadIndex + 7);
    }
  }

  // Return original URL if it's not a Cloudinary upload URL
  return url;
};

/**
 * Resolves full URL for Cloudinary, absolute URLs, or local backend static assets.
 * 
 * @param {string} img - The image path or URL
 * @param {number} width - Desired width for optimization (optional)
 * @returns {string} - The fully-qualified image URL
 */
export const resolveImageUrl = (img, width = 600) => {
  if (!img || typeof img !== "string" || img.trim() === "") {
    return "https://placehold.co/600x400?text=Delicious+Food";
  }
  const cleanImg = img.trim();
  if (cleanImg.startsWith("http://") || cleanImg.startsWith("https://")) {
    return optimizeCloudinaryImage(cleanImg, width);
  }
  if (cleanImg.startsWith("data:") || cleanImg.startsWith("blob:")) {
    return cleanImg;
  }
  const apiBase = API_BASE || "";
  const serverBase = apiBase.replace(/\/api\/?$/, "");
  let cleanPath = cleanImg.startsWith("/") ? cleanImg : `/${cleanImg}`;

  // Automatically serve lightweight WebP asset for product uploads
  if (cleanPath.includes("/uploads/products/") && cleanPath.toLowerCase().endsWith(".png")) {
    cleanPath = cleanPath.replace(/\.png$/i, ".webp");
  }

  return `${serverBase}${cleanPath}`;
};

export const getOptimizedImageUrl = resolveImageUrl;
