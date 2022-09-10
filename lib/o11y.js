import Libhoney from "libhoney";

import pkg from "../package.json";

const honey = new Libhoney({
  apiHost: "https://api.honeycomb.io",
  writeKey: process.env.HONEY_API_KEY,
  dataset: process.env.HONEY_DATASET,
  userAgent: `eutiveumsonho/${pkg.version}`,
  // disabled: true // uncomment for testing or development.
});

export default honey;
