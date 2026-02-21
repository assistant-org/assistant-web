import { useState, useEffect } from "react";

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
};
