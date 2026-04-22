import { getNonPassiveArg } from '../../getPassiveArg/src/getPassiveArg';
import { isBrowser } from '../../isBrowser';

/**
 * Disables scrolling by preventing default behavior for various input events.
 */

// Array of keys that trigger scrolling
const keys = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', ' ', 'PageUp', 'PageDown', 'End', 'Home'];

/**
 * Prevents the default behavior of an event.
 * @param event - The event for which to prevent the default behavior.
 */
const preventDefault = (event: Event): void => {
  event.preventDefault();
};

/**
 * Prevents the default behavior for specific keys that trigger scrolling.
 * @param event - The keyboard event.
 */
const preventDefaultForScrollKeys = (event: KeyboardEvent): void => {
  if (keys.includes(event.key)) {
    preventDefault(event);
    return;
  }
};

// Detects the appropriate wheel event based on browser support
const wheelEvent = isBrowser() && 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

/**
 * Disables scrolling by adding event listeners to various input events.
 */
export const disableScroll = (): void => {
  if (isBrowser()) {
    window.addEventListener('DOMMouseScroll', preventDefault, false); // older Firefox (no passive needed)
    window.addEventListener(wheelEvent, preventDefault, getNonPassiveArg()); // wheel - must preventDefault
    window.addEventListener('touchmove', preventDefault, getNonPassiveArg()); // touchmove - must preventDefault
    window.addEventListener('keydown', preventDefaultForScrollKeys, false); // keydown
    document.body.style.overflow = 'hidden';
  }
};

/**
 * Enables scrolling by removing event listeners for various input events.
 */
export const enableScroll = (): void => {
  if (isBrowser()) {
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.removeEventListener(wheelEvent, preventDefault, getNonPassiveArg());
    window.removeEventListener('touchmove', preventDefault, getNonPassiveArg());
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    document.body.style.overflow = '';
  }
};
