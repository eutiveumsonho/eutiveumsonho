const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "pt",
    locales: ["en", "fr", "pt", "es"],
    localePath: path.resolve("./public/locales"),
  },
};
