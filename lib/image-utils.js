/**
 * Get the correct image path for display
 * Handles various image path formats:
 * - Full URL (http/https)
 * - Absolute path (starts with /)
 * - Relative filename only
 * 
 * @param {string} imagePath - The image path from database
 * @param {string} folder - The upload folder (general, destinations, trips)
 * @returns {string} - The correct image path for src attribute
 */
export function getImagePath(imagePath, folder = 'general') {
  if (!imagePath) return null;
  
  // If it's already a full URL or absolute path, use it directly
  if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Otherwise, prepend the uploads folder path
  return `/uploads/${folder}/${imagePath}`;
}

/**
 * Get placeholder for missing images
 * @param {string} type - Type of placeholder (guide, destination, trip)
 * @returns {string} - Emoji placeholder
 */
export function getImagePlaceholder(type = 'default') {
  const placeholders = {
    guide: '👨‍🏫',
    destination: '🏔️',
    trip: '🎒',
    default: '📷'
  };
  
  return placeholders[type] || placeholders.default;
}
