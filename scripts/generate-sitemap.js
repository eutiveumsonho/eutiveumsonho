const fs = require("fs");
const globby = require("globby");

// Needs empty line to generate root paths
const skipMatch = [
  "!pages/my-dreams.jsx",
  "!pages/account.jsx",
  "!pages/publish",
  "!pages/_*.jsx",
  "!pages/api",
  "!pages/auth/error.jsx",
  "!pages/auth/verify-request.jsx",
  "!pages/dreams",
  "!pages/saved-dreams.jsx",
  "!pages/insights.jsx",
  "!pages/404.jsx",
  "!pages/500.jsx",
  "!pages/inbox.jsx",
  "!pages/profile/[username].jsx",
];

// Important! The following issue has useful information on
// how to handle dynamic routes correctly:
// https://github.com/vercel/next.js/issues/9051.

/**
 * Generates an XML URL loc
 * @param {string[]} pages - The set of filenames under the pages folder.
 */
function generateUrlLoc(pages) {
  const routes = pages
    .map((page) => {
      const path = page
        .replace("pages", "")
        .replace(".js", "")
        .replace(".jsx", "");
      const route = path === "/index" ? "" : path;

      return `
  <url>
      <loc>${`https://eutiveumsonho.com${route}`}</loc>
  </url>
          `;
    })
    .join("");

  return routes;
}

(async () => {
  const pages = await globby(["pages/**/*", ...skipMatch]);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${generateUrlLoc(pages)}
</urlset>
<!-- This is a generated file. Don't change this. -->
<!-- For more information, visit this file at scripts/generate-sitemap.js -->
    `;

  fs.writeFileSync("public/sitemap.xml", sitemap);

  console.log("Sitemap successfully generated.");
})();
