/**
 * Scrolls an element into view.
 * @param $el - The ID of the element to scroll into view.
 * @param behavior - Optional scroll behavior. Can be 'auto' or 'smooth'.
 * @param block - Optional vertical alignment. Can be 'start', 'center', 'end', or 'nearest'.
 * @param inline - Optional horizontal alignment. Can be 'start', 'center', 'end', or 'nearest'.
 */
export const scrollIntoView = (
  $el: HTMLElement | null | undefined,
  behavior: ScrollBehavior = 'smooth',
  block: ScrollLogicalPosition = 'start',
  inline: ScrollLogicalPosition = 'nearest',
): void => {
  if ($el) {
    $el.scrollIntoView({
      behavior,
      block,
      inline,
    });
  }
};
