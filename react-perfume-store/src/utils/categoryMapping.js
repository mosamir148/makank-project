/**
 * Maps URL category keys to database category names
 * This ensures that category links from homepage/navbar work correctly
 */
export const categoryKeyToName = {
  'oud-charcoal': 'Oud Charcoal',
  'incense': 'Incense',
  'accessories': 'Accessories',
  'offers': 'Offers',
  'perfumes': 'Perfumes',
};

/**
 * Converts a URL category key to the database category name
 * @param {string} categoryKey - The category key from URL (e.g., "oud-charcoal")
 * @returns {string|null} - The database category name or null if not found
 */
export const getCategoryNameFromKey = (categoryKey) => {
  if (!categoryKey) return null;
  return categoryKeyToName[categoryKey.toLowerCase()] || categoryKey;
};

/**
 * Finds the best matching category from available categories
 * This handles cases where the database might have slightly different category names
 * @param {string} categoryKey - The category key from URL
 * @param {string[]} availableCategories - Array of available category names from database
 * @returns {string|null} - The matched category name or null
 */
export const findMatchingCategory = (categoryKey, availableCategories) => {
  if (!categoryKey || !availableCategories || availableCategories.length === 0) {
    return null;
  }

  // First, try the direct mapping
  const mappedName = getCategoryNameFromKey(categoryKey);
  if (mappedName && availableCategories.includes(mappedName)) {
    return mappedName;
  }

  // Try case-insensitive matching
  const lowerKey = categoryKey.toLowerCase();
  const matched = availableCategories.find(cat => 
    cat.toLowerCase() === lowerKey || 
    cat.toLowerCase().replace(/\s+/g, '-') === lowerKey ||
    cat.toLowerCase().replace(/\s+/g, '') === lowerKey.replace(/-/g, '')
  );

  return matched || null;
};

