/**
 * Preset Management Utilities
 * Handles cookie storage, validation, and default presets for MoveSyncUI
 */

export const DEFAULT_PRESETS = {
  presets: [
    {
      id: "roughing",
      label: "Roughing",
      movePitch: 0.2,      // mm
      rapidPitch: 0.2      // mm
    },
    {
      id: "finishing",
      label: "Finishing",
      movePitch: 0.08,     // mm
      rapidPitch: 0.08     // mm
    }
  ],
  selectedPresetId: "roughing"
};

/**
 * Load presets from cookie
 * @param {Object} cookies - Cookie object from useCookies
 * @returns {Object|null} - Preset data or null if not found/invalid
 */
export const loadPresetsFromCookie = (cookies) => {
  try {
    const data = cookies.moveSyncPresets;
    if (!data) {
      console.log('No moveSyncPresets cookie found');
      return null;
    }

    // Cookie is already parsed by react-cookie
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;

    // Validate structure
    if (!parsed.presets || !Array.isArray(parsed.presets)) {
      console.error('Invalid preset structure: presets must be an array');
      return null;
    }

    if (parsed.presets.length === 0) {
      console.log('Empty presets array');
      return null;
    }

    // Validate each preset
    for (const preset of parsed.presets) {
      const error = validatePreset(preset);
      if (error) {
        console.error(`Invalid preset in cookie: ${error}`, preset);
        return null;
      }
    }

    console.log('Loaded presets from cookie:', parsed);
    return parsed;
  } catch (error) {
    console.error('Failed to load presets from cookie:', error);
    return null;
  }
};

/**
 * Save presets to cookie
 * @param {Function} setCookie - setCookie function from useCookies
 * @param {Object} data - Preset data to save
 */
export const savePresetsToCookie = (setCookie, data) => {
  try {
    // Validate before saving
    if (!data.presets || !Array.isArray(data.presets)) {
      throw new Error('Invalid preset data structure');
    }

    // react-cookie will handle JSON stringification
    setCookie('moveSyncPresets', data, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: 'strict'
    });

    console.log('Saved presets to cookie:', data);
  } catch (error) {
    console.error('Failed to save presets to cookie:', error);
  }
};

/**
 * Validate a preset object
 * @param {Object} preset - Preset to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validatePreset = (preset) => {
  if (!preset.id || typeof preset.id !== 'string') {
    return 'Preset must have a valid id';
  }

  if (!preset.label || typeof preset.label !== 'string' || preset.label.trim() === '') {
    return 'Preset must have a non-empty label';
  }

  if (typeof preset.movePitch !== 'number' || isNaN(preset.movePitch) || preset.movePitch <= 0) {
    return 'movePitch must be a positive number';
  }

  if (typeof preset.rapidPitch !== 'number' || isNaN(preset.rapidPitch) || preset.rapidPitch <= 0) {
    return 'rapidPitch must be a positive number';
  }

  return null; // Valid
};

/**
 * Generate a unique preset ID from a label
 * @param {string} label - Preset label
 * @param {Array} existingPresets - Array of existing presets to avoid duplicates
 * @returns {string} - Unique ID
 */
export const generatePresetId = (label, existingPresets = []) => {
  // Create base ID from label (lowercase, replace spaces with underscores)
  let baseId = label.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  // If empty after sanitization, use default
  if (!baseId) {
    baseId = 'preset';
  }

  let id = baseId;
  let counter = 1;

  // Ensure uniqueness
  while (existingPresets.some(p => p.id === id)) {
    id = `${baseId}_${counter}`;
    counter++;
  }

  return id;
};

/**
 * Check if a preset label is duplicate
 * @param {Array} presets - Array of presets
 * @param {string} label - Label to check
 * @param {string} excludeId - ID to exclude from check (for editing)
 * @returns {boolean} - True if duplicate
 */
export const isDuplicateLabel = (presets, label, excludeId = null) => {
  return presets.some(p =>
    p.label.toLowerCase() === label.toLowerCase() &&
    p.id !== excludeId
  );
};
