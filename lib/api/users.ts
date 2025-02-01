import { logError } from "../o11y/log";

/**
 * Updates the user's data.
 */
export async function updateUser(data: Record<string, any>) {
  try {
    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return true;
    }

    logError(await response.text(), {
      service: "api",
      pathname: "/api/account",
      component: "updateUser",
    });

    return false;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/account",
      component: "updateUser",
    });
  }
}
