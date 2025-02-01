import { logError } from "../o11y/log";

export async function createAICompletion(data: Record<string, any>) {
  const body = JSON.stringify(data);

  try {
    const response = await fetch("/api/data/completions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });

    const data = await response.json();

    return { success: true, data };
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data/completions",
      component: "createAICompletion",
    });
    return { success: false };
  }
}
