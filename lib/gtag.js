// reference: https://medium.com/@mikegajdos81/how-to-add-googleanalytics-4-to-nextjs-app-in-4-simple-steps-3c6f9de2f866

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const GA_ADS_ID = process.env.NEXT_PUBLIC_GA_ADS_ID;
export const GA_ADS_ALTERNATIVE_ID = "G-31NC9ZXCJS";

export const GTAG_MANAGER = process.env.NEXT_PUBLIC_GTAG_MANAGER;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url) => {
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
  window.gtag("config", GA_ADS_ID, {
    page_path: url,
  });
  // Uses alternative email address
  window.gtag("config", GA_ADS_ALTERNATIVE_ID, {
    page_path: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
