import { useState, useEffect } from 'react';

/**
 * A React hook that returns a boolean indicating whether the current viewport matches the given media query.
 * 
 * @param query The media query to match against
 * @returns A boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    // Create a media query list to match against
    const mediaQuery = window.matchMedia(query);
    
    // Set the initial value
    setMatches(mediaQuery.matches);
    
    // Define a handler for changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add the event listener
    mediaQuery.addEventListener('change', handler);
    
    // Clean up the event listener
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]); // Re-run the effect if the query changes
  
  return matches;
}
