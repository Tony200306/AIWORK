/**
 * Updates the URL search parameters of the browser without triggering navigation.
 * @param {URLSearchParams | string} searchParams - The URLSearchParams object or string representation of search parameters to be updated.
 * @returns {void}
 */
export const updateURLSearchParamsOfBrowserWithoutNavigation = (searchParams: URLSearchParams | string): void => {
  // Convert searchParams to string if it's a URLSearchParams object
  const searchParams_ = searchParams.toString();

  // Construct new URL based on current pathname and updated search parameters
  const newUrl = [
    window.location.pathname,
    searchParams_.startsWith('?') ? searchParams_ : searchParams_ ? `?${searchParams_}` : '',
  ]
    ?.filter(Boolean)
    .join('');

  // Replace current URL in history without triggering navigation
  window.history.replaceState(null, '', newUrl);
};
