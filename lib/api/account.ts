import { logError } from "../o11y/log";

/**
 * Deletes the account of the currently logged in user.
 */
export async function deleteAccount() {
  try {
    const response = await fetch("/api/account", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
    });

    const data = await response.json();

    return data;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/account",
      component: "deleteAccount",
    });
    return { success: false };
  }
}
