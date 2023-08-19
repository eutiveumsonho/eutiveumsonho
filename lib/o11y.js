import Libhoney from "libhoney";

import pkg from "../package.json";

const honey = new Libhoney({
  apiHost: "https://api.honeycomb.io",
  writeKey: process.env.HONEY_API_KEY
    ? process.env.HONEY_API_KEY
    : process.env.NEXT_PUBLIC_HONEY_API_KEY,
  dataset: process.env.HONEY_DATASET
    ? process.env.HONEY_DATASET
    : process.env.NEXT_PUBLIC_HONEY_DATASET,
  userAgent: `eutiveumsonho/${pkg.version}`,
});

export function logError(error) {
  const identifiers = { error_name: error.name, error_message: error.message };

  delete error.name;
  delete error.message;

  const errObject = {
    ...identifiers,
    error,
    level: "error",
  };

  log(errObject);
}

export function logWarn(data) {
  const warnObject = {
    ...data,
    level: "warn",
  };

  log(warnObject);
}

export function log(data) {
  if (process.env.NODE_ENV === "development") {
    console.log(data);
    return;
  }

  return honey.sendNow(data);
}

export default honey;
