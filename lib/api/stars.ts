import { logError } from "../o11y/log";

/**
 * Stars a post by the currently logged in user.
 */
export async function starPost(data: Record<string, any>) {
  const body = JSON.stringify(data);

  try {
    const response = await fetch("/api/data/stars", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });

    const data = await response.json();

    return { success: true, data };
  } catch (error) {
    logError({
      service: "api",
      pathname: "/api/data/stars",
      component: "starPost",
    });
    return { success: false };
  }
}

/**
 * Unstars a post by the currently logged in user.
 */
export async function unstarPost(data: Record<string, any>) {
  const body = JSON.stringify(data);

  try {
    const response = await fetch("/api/data/stars", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body,
    });

    const data = await response.json();

    return data;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data/stars",
      component: "unstarPost",
    });
    return { success: false };
  }
}
