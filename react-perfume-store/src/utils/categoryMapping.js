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

/**
 * Maps database category names to translation keys
 * This is used to translate category names in the UI
 * Handles both capitalized and lowercase hyphenated formats
 */
export const categoryNameToTranslationKey = {
  // Capitalized formats
  'Incense': 'categoryIncense',
  'Oud Charcoal': 'categoryOudCharcoal',
  'Accessories': 'categoryAccessories',
  'Perfumes': 'categoryPerfumes',
  'offers': 'offers',
  'Offers': 'offers',
  // Lowercase hyphenated formats (as stored in database)
  'incense': 'categoryIncense',
  'oud-charcoal': 'categoryOudCharcoal',
  'accessories': 'categoryAccessories',
  'perfumes': 'categoryPerfumes',
  // Lowercase with spaces
  'oud charcoal': 'categoryOudCharcoal',
};

/**
 * Gets the translation key for a database category name
 * Handles case-insensitive matching and different formats
 * @param {string} categoryName - The category name from database (e.g., "Incense" or "incense")
 * @returns {string} - The translation key (e.g., "categoryIncense") or the original name if not found
 */
export const getCategoryTranslationKey = (categoryName) => {
  if (!categoryName) return categoryName;
  
  // Trim whitespace
  const trimmed = categoryName.trim();
  
  // First try exact match
  if (categoryNameToTranslationKey[trimmed]) {
    return categoryNameToTranslationKey[trimmed];
  }
  
  // Try case-insensitive match
  const lowerCategory = trimmed.toLowerCase();
  if (categoryNameToTranslationKey[lowerCategory]) {
    return categoryNameToTranslationKey[lowerCategory];
  }
  
  // Try matching with normalized format (handle spaces and hyphens)
  const normalized = lowerCategory.replace(/\s+/g, '-');
  if (categoryNameToTranslationKey[normalized]) {
    return categoryNameToTranslationKey[normalized];
  }
  
  // Try matching with spaces (convert hyphens to spaces)
  const withSpaces = lowerCategory.replace(/-/g, ' ');
  if (categoryNameToTranslationKey[withSpaces]) {
    return categoryNameToTranslationKey[withSpaces];
  }
  
  // Try matching capitalized format
  const capitalized = trimmed.split(/[\s-]+/).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  if (categoryNameToTranslationKey[capitalized]) {
    return categoryNameToTranslationKey[capitalized];
  }
  
  // Fallback: direct mappings for common variations (case-insensitive)
  if (lowerCategory === 'oud-charcoal' || lowerCategory === 'oud charcoal') {
    return 'categoryOudCharcoal';
  }
  if (lowerCategory === 'incense') {
    return 'categoryIncense';
  }
  if (lowerCategory === 'perfumes') {
    return 'categoryPerfumes';
  }
  if (lowerCategory === 'accessories') {
    return 'categoryAccessories';
  }
  
  return trimmed;
};

