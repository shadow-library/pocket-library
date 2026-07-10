/**
 * Importing npm packages
 */
import { VolumeManager } from 'react-native-volume-manager';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type VolumeKeyDirection = 'up' | 'down';

type VolumeKeyListener = (direction: VolumeKeyDirection) => void;

/**
 * Declaring the constants
 */

// After every press the level is snapped back to a baseline so there is always headroom to detect the
// next up or down key. The baseline tracks the user's own volume (only nudged off an extreme) so
// opening a chapter never yanks their volume to a fixed value.
const SETTLE_MS = 120;
const MIN_DELTA = 0.001;
const MIN_BASELINE = 0.15;
const MAX_BASELINE = 0.85;

// Turns hardware volume-key presses into up/down navigation intents while swallowing the actual volume
// change: the native slider is hidden and the level is reset after each press. Android observes the
// media volume, so a press fires the listener before we restore the baseline.
class VolumeKeysService {
  private readonly listeners = new Set<VolumeKeyListener>();
  private subscription: { remove: () => void } | null = null;
  private baseline = 0.5;
  private resetting = false;

  constructor(private readonly volume = VolumeManager) {}

  onVolumeKey(listener: VolumeKeyListener): () => void {
    this.listeners.add(listener);
    if (this.subscription === null) this.start();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stop();
    };
  }

  private start(): void {
    this.volume.showNativeVolumeUI({ enabled: false }).catch(() => undefined);
    this.volume
      .getVolume()
      .then((result) => {
        this.baseline = Math.min(MAX_BASELINE, Math.max(MIN_BASELINE, result.volume));
        if (Math.abs(this.baseline - result.volume) > MIN_DELTA) this.volume.setVolume(this.baseline, { showUI: false }).catch(() => undefined);
      })
      .catch(() => undefined)
      .finally(() => {
        if (this.subscription === null && this.listeners.size > 0) this.subscription = this.volume.addVolumeListener((result) => this.handle(result.volume));
      });
  }

  private stop(): void {
    this.subscription?.remove();
    this.subscription = null;
    this.volume.showNativeVolumeUI({ enabled: true }).catch(() => undefined);
  }

  private handle(level: number): void {
    if (this.resetting) return;
    const delta = level - this.baseline;
    if (Math.abs(delta) < MIN_DELTA) return;
    const direction: VolumeKeyDirection = delta > 0 ? 'up' : 'down';
    this.listeners.forEach((listener) => listener(direction));
    this.reset();
  }

  private reset(): void {
    this.resetting = true;
    this.volume
      .setVolume(this.baseline, { showUI: false })
      .catch(() => undefined)
      .finally(() => setTimeout(() => (this.resetting = false), SETTLE_MS));
  }
}

export const volumeKeysService = new VolumeKeysService();
