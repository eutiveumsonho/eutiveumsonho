import { useState, useEffect } from 'react';

/**
 * Custom hook for collecting user geolocation with privacy-conscious implementation
 * @returns {Object} location state and functions
 */
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasAskedPermission, setHasAskedPermission] = useState(false);

  // Check if geolocation is supported
  const isSupported = typeof window !== 'undefined' && 'geolocation' in navigator;

  /**
   * Request user location with appropriate privacy handling
   */
  const requestLocation = () => {
    if (!isSupported) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasAskedPermission(true);

    const options = {
      enableHighAccuracy: false, // Privacy-conscious: don't require GPS
      timeout: 10000, // 10 second timeout
      maximumAge: 600000, // Accept cached location up to 10 minutes old
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        
        setLocation(locationData);
        setHasPermission(true);
        setIsLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        setError(errorMessage);
        setHasPermission(false);
        setIsLoading(false);
      },
      options
    );
  };

  /**
   * Clear location data
   */
  const clearLocation = () => {
    setLocation(null);
    setError(null);
    setHasPermission(false);
  };

  return {
    location,
    error,
    isLoading,
    hasPermission,
    hasAskedPermission,
    isSupported,
    requestLocation,
    clearLocation,
  };
}