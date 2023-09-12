const { patchWebpackConfig } = require("next-global-css");
const webpackNodeExternals = require("webpack-node-externals");
const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  i18n,
  webpack: (config, options) => {
    patchWebpackConfig(config, options);

    if (options.isServer) {
      config.externals = webpackNodeExternals({
        // Uses list to add this modules for server bundle and process.
        allowlist: ["@remirror/styles"],
      });

      require("./scripts/generate-sitemap");
    }

    return config;
  },
};

module.exports = nextConfig;
