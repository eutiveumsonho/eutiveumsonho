import { logError } from "./o11y";

export async function sendWaitListInviteMail(data) {
  try {
    await fetch("/api/wait-list-invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function createDream(data) {
  const body = JSON.stringify(data);

  try {
    const response = await fetch("/api/data", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });

    const data = await response.json();

    return { success: true, data };
  } catch (error) {
    return { success: false };
  }
}

export async function saveDream(dreamId, dreamData) {
  const body = JSON.stringify({ dreamId, dreamData });

  try {
    const response = await fetch("/api/data", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body,
    });

    return { success: true, data: response };
  } catch (error) {
    return { success: false };
  }
}

export async function updateDreamVisibility(dreamId, visibility) {
  const body = JSON.stringify({ dreamId, visibility });

  try {
    const response = await fetch("/api/data/publish", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body,
    });

    return { success: true, data: response };
  } catch (error) {
    logError({ ...error, from_api_lib: true });
    return { success: false };
  }
}

export async function deleteAccount() {
  try {
    const response = await fetch("/api/account", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
    });

    const data = await response.json();

    return data;
  } catch (error) {
    logError({ ...error, from_api_lib: true });
    return { success: false };
  }
}

export async function deleteDream(dreamId) {
  const body = JSON.stringify({ dreamId });

  try {
    const response = await fetch("/api/data", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body,
    });

    const data = await response.json();

    return data;
  } catch (error) {
    logError({ ...error, from_api_lib: true });
    return { success: false };
  }
}

export async function searchDreams(query) {
  try {
    const response = await fetch(`/api/data?query=${encodeURI(query)}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
    });

    const data = await response.json();

    return data;
  } catch (error) {
    logError({ ...error, from_api_lib: true });
    return { success: false };
  }
}
