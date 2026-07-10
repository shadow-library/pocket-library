/**
 * Importing npm packages
 */
import { useEffect, useRef } from 'react';

/**
 * Importing user defined packages
 */
import { volumeKeysService } from '@/core/infrastructure/volume-keys.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

// Volume Down advances a chapter, Volume Up goes back. The callbacks live in a ref so the subscription
// stays put across chapter changes instead of tearing down and restoring the native volume UI each time.
export function useVolumeChapterNav(enabled: boolean, onNext: () => void, onPrev: () => void): void {
  const handlers = useRef({ onNext, onPrev });

  useEffect(() => {
    handlers.current = { onNext, onPrev };
  }, [onNext, onPrev]);

  useEffect(() => {
    if (!enabled) return;
    return volumeKeysService.onVolumeKey((direction) => {
      if (direction === 'down') handlers.current.onNext();
      else handlers.current.onPrev();
    });
  }, [enabled]);
}
