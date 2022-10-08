import Libhoney from "libhoney";

import pkg from "../package.json";

const honey = new Libhoney({
  apiHost: "https://api.honeycomb.io",
  writeKey: process.env.HONEY_API_KEY,
  dataset: process.env.HONEY_DATASET,
  userAgent: `eutiveumsonho/${pkg.version}`,
});

export function logError(error) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  const identifiers = { error_name: error.name, error_message: error.message };

  delete error.name;
  delete error.message;

  const errObject = {
    ...identifiers,
    error,
    level: "error",
  };

  honey.sendNow(errObject);
}

export function logWarn(data) {
  if (process.env.NODE_ENV === "development") {
    console.warn(data);
  }

  const warnObject = {
    ...data,
    level: "warn",
  };

  honey.sendNow(warnObject);
}

export default honey;
