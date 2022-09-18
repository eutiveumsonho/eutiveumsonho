export const chatwoot = (d, t) => {
  const baseUrl = "https://app.chatwoot.com";
  const g = d.createElement(t);
  const s = d.getElementsByTagName(t)[0];
  g.src = baseUrl + "/packs/js/sdk.js";
  g.defer = true;
  g.async = true;
  s.parentNode.insertBefore(g, s);
  g.onload = function () {
    window.chatwootSDK.run({
      websiteToken: process.env.NEXT_PUBLIC_CHATWOOT_API_KEY,
      baseUrl,
    });
  };
};
