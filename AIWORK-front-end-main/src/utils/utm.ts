/**
 * Extracts UTM parameters from URL search params
 */
export const getUtmParams = (searchParams: URLSearchParams) => {
  const utm_source = searchParams.get("utm_source");
  const utm_medium = searchParams.get("utm_medium");
  const utm_campaign = searchParams.get("utm_campaign");
  const campaign_id = searchParams.get("campaign_id");

  return {
    utm_source,
    utm_medium,
    utm_campaign,
    campaign_id,
  };
};

/**
 * Determines traffic source based on UTM parameters
 *
 * V1 Attribution Logic:
 * - If utm_source exists AND utm_medium contains "paid"/"cpc"/"ppc" → "paid"
 * - If utm_source exists but not paid → "organic"
 * - If no utm_source → "direct"
 *
 * Examples:
 * - ?utm_source=google&utm_medium=cpc → "paid"
 * - ?utm_source=facebook&utm_medium=paid_social → "paid"
 * - ?utm_source=google&utm_medium=organic → "organic"
 * - ?utm_source=newsletter → "organic"
 * - No UTM params → "direct"
 */
export const determineSource = (
  utm_source: string | null,
  utm_medium: string | null
): "paid" | "organic" | "direct" | "unknown" => {
  if (!utm_source) {
    return "direct";
  }

  if (utm_medium) {
    const lowerMedium = utm_medium.toLowerCase();
    if (
      lowerMedium.includes("paid") ||
      lowerMedium.includes("cpc") ||
      lowerMedium.includes("ppc")
    ) {
      return "paid";
    }
  }

  return "organic";
};

/**
 * Gets session tracking properties from URL search params
 */
export const getSessionTrackingProps = (searchParams: URLSearchParams) => {
  const { utm_source, utm_medium, utm_campaign, campaign_id } =
    getUtmParams(searchParams);
  const source = determineSource(utm_source, utm_medium);

  return {
    source,
    utm_source,
    utm_medium,
    utm_campaign,
    campaign_id,
  };
};
