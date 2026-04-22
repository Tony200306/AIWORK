import mixpanel from "mixpanel-browser";

let isInitialized = false;

export const initMixpanel = (): void => {
  if (typeof window !== "undefined" && !isInitialized) {
    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
    if (token) {
      mixpanel.init(token, {
        debug: true,
        track_pageview: true,
        persistence: "localStorage",
        api_host: '/mp',
        ignore_dnt: true,
      });
      isInitialized = true;
      console.log("Mixpanel initialized successfully", token);
    } else {
      console.error("NEXT_PUBLIC_MIXPANEL_TOKEN is missing!");
    }
  }
};

export const identify = (userId: string): void => {
  if (typeof window !== "undefined" && isInitialized) {
    mixpanel.identify(userId);
    console.log("Mixpanel user identified:", userId);
    return;
  }
  console.warn("Mixpanel not initialized, skipping identify:", userId);
};

export const setUserProperties = (properties: Record<string, unknown>): void => {
  if (typeof window !== "undefined" && isInitialized) {
    mixpanel.people.set(properties);
    return;
  }
  console.warn("Mixpanel not initialized, skipping people.set");
};

export const reset = (): void => {
  if (typeof window !== "undefined" && isInitialized) {
    mixpanel.reset();
    console.log("Mixpanel user reset");
    return;
  }
  console.warn("Mixpanel not initialized, skipping reset");
};

export const track = (name: string, props: Record<string, unknown> = {}): void => {
  if (typeof window !== "undefined" && isInitialized) {
    mixpanel.track(name, props);
    return;
  }
  console.warn("Mixpanel not initialized, skipping track:", name);
};