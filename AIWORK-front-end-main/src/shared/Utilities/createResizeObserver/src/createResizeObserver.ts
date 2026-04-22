import { getPassiveArg } from '../../getPassiveArg';
import { isBrowser } from '../../isBrowser';

export interface ResizeObserverListener {
  (): void;
}

/**
 * Creates an object that provides methods to add or remove resize listeners.
 * The listeners can either be attached to a specific element using ResizeObserver
 * or fall back to window resize event listener.
 *
 * @function
 * @returns {Object} An object containing methods to add or remove resize listeners.
 * @property {Function} addListener - Adds a resize listener for the specified element or the document body by default.
 * @property {Function} removeListener - Removes the specified resize listener.
 *
 * @typedef {Function} ResizeObserverListener
 *   A callback function that is invoked when the size of the target element changes.
 *   It receives an array of ResizeObserverEntry objects as a parameter.
 *
 * @example ```typescript
  const resizeObserver = createResizeObserver();
  // Define a listener
  const myListener = () => { console.log('Resized!'); };
  // Add listener to observe an element
  resizeObserver.addListener(myListener, someElement);
  // Remove listener
  resizeObserver.removeListener(myListener);
  ```
 */
export const createResizeObserver = (): {
  addListener: (listener: ResizeObserverListener, element?: Element | null, options?: AddEventListenerOptions) => void;
  removeListener: (listener: ResizeObserverListener) => void;
} => {
  let resizeObserver: ResizeObserver | undefined = undefined;

  const addListener = (listener: ResizeObserverListener, element?: Element | null): void => {
    if (!isBrowser()) {
      return;
    }
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(listener);
      resizeObserver.observe(element ?? document.body);
    } else {
      listener();
      window.addEventListener('resize', listener, getPassiveArg());
    }
  };

  const removeListener = (listener: ResizeObserverListener): void => {
    if (!isBrowser()) {
      return;
    }
    if (window.ResizeObserver) {
      resizeObserver?.disconnect();
    } else {
      window.removeEventListener('resize', listener);
    }
  };

  return {
    addListener,
    removeListener,
  };
};
