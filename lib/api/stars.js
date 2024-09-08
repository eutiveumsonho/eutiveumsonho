import { logError } from "../o11y/log";

export async function starPost(data) {
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

export async function unstarPost(data) {
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
