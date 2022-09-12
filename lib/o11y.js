import Libhoney from "libhoney";

import pkg from "../package.json";

const honey = new Libhoney({
  apiHost: "https://api.honeycomb.io",
  writeKey: process.env.HONEY_API_KEY,
  dataset: process.env.HONEY_DATASET,
  userAgent: `eutiveumsonho/${pkg.version}`,
  disabled: process.env.NODE_ENV !== "production",
});

export function logError(error) {
  const identifiers = { error_name: error.name, error_message: error.message };

  delete error.name;
  delete error.message;

  honey.sendNow({
    ...identifiers,
    ...error,
    level: "error",
  });
}

export function logWarn(data) {
  honey.sendNow({
    ...data,
    level: "warn",
  });
}

export default honey;
