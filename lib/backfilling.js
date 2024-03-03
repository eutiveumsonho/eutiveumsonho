/** @module lib/backfilling */

/**
 * Some new features may include data generation,
 * and this data naturally won't not be available for old users,
 * unless we force it.
 *
 * This module is responsible for that: it will be executed
 * on every deployment that has the NEXT_MANUAL_SIG_HANDLE
 * environment variable set to 1 or true, so that we can manually
 * trigger it and make sure that every user within the
 * platform has its data consistent.
 *
 * This is not necessarily the best way to do this, but it's
 * the best we can do for now.
 *
 * Before shipping this code to production we always test it
 * on the development environment.
 *
 * It was used:
 * - Generate word frequency from each dream
 *
 * @link https://nextjs.org/docs/deployment#manual-graceful-shutdowns
 */

let EXECUTED = false;

if (process.env.NEXT_MANUAL_SIG_HANDLE) {
  console.log("MANUAL SIG HANDLE IS ON");

  if (!EXECUTED) {
    // Backfilling here

    EXECUTED = true;
  }
}
