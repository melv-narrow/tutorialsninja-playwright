/**
 * Centralized test data constants to prevent test breakage when demo site inventory changes.
 *
 * These product names are known to exist on the tutorialsninja demo site.
 * If tests start failing due to missing products, update these constants rather than
 * changing individual test files.
 */

export const PRODUCTS = {
  /** MacBook - Featured product, commonly used in cart/comparison tests */
  MACBOOK: 'MacBook',

  /** MacBook Pro - Available in search results */
  MACBOOK_PRO: 'MacBook Pro',

  /** iPhone - Used in comparison tests */
  IPHONE: 'iPhone',

  /** Apple Cinema 30" - Appears in description search results */
  APPLE_CINEMA: 'Apple Cinema 30"',
} as const;

export const SEARCH_TERMS = {
  /** Search term that returns multiple MacBook products */
  MACBOOK: 'MacBook',

  /** Search term for description-based search tests */
  MACBOOK_LOWERCASE: 'macbook',

  /** Search term that returns no results */
  NO_RESULTS: '',
} as const;

export const CURRENCIES = {
  /** Euro currency option */
  EURO: '€Euro',

  /** Euro symbol for validation */
  EURO_SYMBOL: '€',
} as const;
