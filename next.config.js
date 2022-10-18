const { patchWebpackConfig } = require("next-global-css");
const webpackNodeExternals = require("webpack-node-externals");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
