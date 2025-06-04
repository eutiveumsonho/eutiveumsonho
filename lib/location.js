/**
 * Utility functions for handling location data from various sources
 */

/**
 * Extract location information from request headers
 * This provides a fallback when user doesn't grant geolocation permission
 * @param {Object} req - Next.js request object
 * @returns {Object|null} Location data from headers or null
 */
export function inferLocationFromHeaders(req) {
  try {
    // Check common location headers set by CDNs and proxies
    const country = req.headers['cf-ipcountry'] || // Cloudflare
                   req.headers['x-country-code'] || // Common proxy header
                   req.headers['x-geo-country']; // Another common header

    const region = req.headers['cf-region'] || 
                  req.headers['x-region-code'] ||
                  req.headers['x-geo-region'];

    const city = req.headers['cf-ipcity'] || 
                req.headers['x-city'] ||
                req.headers['x-geo-city'];

    const timezone = req.headers['cf-timezone'] ||
                    req.headers['x-timezone'];

    // Get IP address for logging purposes (not stored)
    const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
              req.headers['x-real-ip'] ||
              req.connection?.remoteAddress;

    // Only return data if we have at least country information
    if (country) {
      return {
        type: 'inferred',
        country: country,
        region: region || null,
        city: city || null,
        timezone: timezone || null,
        timestamp: new Date().toISOString(),
        source: 'headers'
      };
    }

    return null;
  } catch (error) {
    console.error('Error inferring location from headers:', error);
    return null;
  }
}

/**
 * Validate and sanitize client-provided location data
 * @param {Object} locationData - Location data from client
 * @returns {Object|null} Validated location data or null
 */
export function validateLocationData(locationData) {
  if (!locationData || typeof locationData !== 'object') {
    return null;
  }

  try {
    const { latitude, longitude, accuracy, timestamp } = locationData;

    // Validate latitude and longitude
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return null;
    }

    // Check if coordinates are within valid ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return null;
    }

    // Validate accuracy if provided
    if (accuracy !== undefined && (typeof accuracy !== 'number' || accuracy < 0)) {
      return null;
    }

    // Validate timestamp
    if (timestamp && isNaN(new Date(timestamp).getTime())) {
      return null;
    }

    return {
      type: 'precise',
      latitude: Number(latitude.toFixed(6)), // Limit precision for privacy
      longitude: Number(longitude.toFixed(6)),
      accuracy: accuracy ? Math.round(accuracy) : null,
      timestamp: timestamp || new Date().toISOString(),
      source: 'geolocation'
    };
  } catch (error) {
    console.error('Error validating location data:', error);
    return null;
  }
}

/**
 * Combine client location with server-inferred location
 * Prioritizes precise client location over inferred location
 * @param {Object} clientLocation - Location from client geolocation
 * @param {Object} inferredLocation - Location from request headers
 * @returns {Object|null} Best available location data
 */
export function combineLocationData(clientLocation, inferredLocation) {
  const validClientLocation = validateLocationData(clientLocation);
  
  if (validClientLocation) {
    return validClientLocation;
  }
  
  return inferredLocation;
}