const { patchWebpackConfig } = require("next-global-css");
const webpackNodeExternals = require("webpack-node-externals");
const path = require("path");

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
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
};

module.exports = nextConfig;
