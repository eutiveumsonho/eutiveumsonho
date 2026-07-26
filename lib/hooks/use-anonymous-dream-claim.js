import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { claimAnonymousDreams } from '../api/posts';
import { getAnonymousDreams, clearAnonymousDreams } from '../anonymous-dreams';
import { logError } from '../o11y/log';

/**
 * Hook that automatically claims anonymous dreams when a user signs in
 */
export function useAnonymousDreamClaim() {
  const { data: session, status } = useSession();
  const hasClaimedRef = useRef(false);

  useEffect(() => {
    // Only run this once when the user becomes authenticated
    if (status === 'authenticated' && session?.user && !hasClaimedRef.current) {
      claimUserAnonymousDreams();
      hasClaimedRef.current = true;
    }
  }, [status, session]);

  const claimUserAnonymousDreams = async () => {
    try {
      const anonymousDreams = getAnonymousDreams();
      
      if (anonymousDreams.length === 0) {
        return;
      }

      // Extract anonymous keys from localStorage dreams
      const anonymousKeys = anonymousDreams.map(dream => dream.anonymousKey);

      // Call API to claim the dreams
      const { success, data } = await claimAnonymousDreams(anonymousKeys);

      if (success && data?.claimedCount > 0) {
        // Clear anonymous dreams from localStorage since they're now claimed
        clearAnonymousDreams();
        
        console.log(`Successfully claimed ${data.claimedCount} anonymous dreams`);
      }
    } catch (error) {
      logError(error, {
        service: 'web',
        component: 'useAnonymousDreamClaim',
      });
    }
  };
}