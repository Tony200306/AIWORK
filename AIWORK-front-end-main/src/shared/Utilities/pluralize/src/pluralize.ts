interface Pluralize {
  /** The singular form of the word. */
  singular: string;
  /** The plural form of the word. */
  plural: string;
  /** The count of items for which pluralization is being applied. */
  count: number;
}

/**
 * Returns the appropriate pluralization of a word based on the count.
 * @param {Pluralize} params The parameters object containing count, plural, and singular forms.
 * @returns {string} The appropriate pluralization based on the count.
 */
export const pluralize = ({ count, plural, singular }: Pluralize): string => {
  if (count >= 2) {
    return plural;
  }
  return singular;
};
