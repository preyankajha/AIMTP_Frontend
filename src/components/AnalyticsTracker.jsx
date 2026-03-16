import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Record a hit on every route change
    const recordHit = async () => {
      try {
        await api.post('/analytics/hit', {
          path: location.pathname + location.search
        });
      } catch (error) {
        // Silent fail for analytics
        console.groupCollapsed('Analytics Error');
        console.error(error);
        console.groupEnd();
      }
    };

    recordHit();
  }, [location]);

  return null;
};

export default AnalyticsTracker;
