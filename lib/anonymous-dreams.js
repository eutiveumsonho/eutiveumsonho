/**
 * Utility functions for managing anonymous dreams in localStorage
 */

const ANONYMOUS_DREAMS_KEY = 'eutiveumsonho__anonymousDreams';
const PUBLIC_EDITOR_DATA_KEY = 'eutiveumsonho__publicEditorData';

/**
 * Get all anonymous dreams from localStorage
 * @returns {Array} Array of anonymous dream objects
 */
export function getAnonymousDreams() {
  if (typeof window === 'undefined') return [];
  
  try {
    const dreams = localStorage.getItem(ANONYMOUS_DREAMS_KEY);
    return dreams ? JSON.parse(dreams) : [];
  } catch (error) {
    console.error('Error reading anonymous dreams from localStorage:', error);
    return [];
  }
}

/**
 * Save a new anonymous dream to localStorage
 * @param {string} dreamId - The dream ID
 * @param {string} anonymousKey - The anonymous key for this dream
 * @param {string} html - The dream HTML content
 * @param {string} text - The dream text content
 */
export function saveAnonymousDream(dreamId, anonymousKey, html, text) {
  if (typeof window === 'undefined') return;
  
  try {
    const dreams = getAnonymousDreams();
    const newDream = {
      dreamId,
      anonymousKey,
      html,
      text,
      createdAt: new Date().toISOString()
    };
    
    dreams.push(newDream);
    localStorage.setItem(ANONYMOUS_DREAMS_KEY, JSON.stringify(dreams));
    
    // Clear the public editor data since it's now saved as a dream
    localStorage.removeItem(PUBLIC_EDITOR_DATA_KEY);
  } catch (error) {
    console.error('Error saving anonymous dream to localStorage:', error);
  }
}

/**
 * Remove an anonymous dream from localStorage
 * @param {string} dreamId - The dream ID to remove
 */
export function removeAnonymousDream(dreamId) {
  if (typeof window === 'undefined') return;
  
  try {
    const dreams = getAnonymousDreams();
    const filteredDreams = dreams.filter(dream => dream.dreamId !== dreamId);
    localStorage.setItem(ANONYMOUS_DREAMS_KEY, JSON.stringify(filteredDreams));
  } catch (error) {
    console.error('Error removing anonymous dream from localStorage:', error);
  }
}

/**
 * Clear all anonymous dreams from localStorage
 */
export function clearAnonymousDreams() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(ANONYMOUS_DREAMS_KEY);
  } catch (error) {
    console.error('Error clearing anonymous dreams from localStorage:', error);
  }
}

/**
 * Get the count of anonymous dreams
 * @returns {number} Number of anonymous dreams
 */
export function getAnonymousDreamsCount() {
  return getAnonymousDreams().length;
}