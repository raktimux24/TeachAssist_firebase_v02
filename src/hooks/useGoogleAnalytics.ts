import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { useLocation } from 'react-router-dom';

// Initialize Google Analytics with your Measurement ID
export const initGA = () => {
  console.log('GA initialization');
  ReactGA.initialize('G-PC98ZDVNT3');
};

// Custom hook to track page views
export const useGoogleAnalytics = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Send pageview with the current location's pathname
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    console.log(`Page view tracked: ${location.pathname + location.search}`);
  }, [location]);
};
