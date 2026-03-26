import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const AnalyticsTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

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

  // Track time spent for authenticated users
  useEffect(() => {
    if (!user) return;

    const TRACK_INTERVAL_MS = 30000; // 30 seconds

    const trackTime = async () => {
      if (document.visibilityState === 'visible') {
        try {
          await api.post('/auth/track-time', { deltaSeconds: 30 });
        } catch (error) {
          // silently fail to not spam console
        }
      }
    };

    const intervalId = setInterval(trackTime, TRACK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [user]);

  return null;
};

export default AnalyticsTracker;
