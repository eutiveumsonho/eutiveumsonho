import Sentry from "@sentry/nextjs";

export function logError(error, tags) {
  Sentry.captureException(error, {
    tags,
  });
}
