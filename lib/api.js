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
    console.error({
      error,
      service: "web",
      pathname: "/api/data",
      component: "createDream",
    });
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
    console.error({
      error,
      service: "web",
      pathname: "/api/data",
      component: "saveDream",
    });
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
    console.error({
      error,
      service: "web",
      pathname: "/api/data/publish",
      component: "updateDreamVisibility",
    });
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
    console.error({
      error,
      service: "web",
      pathname: "/api/account",
      component: "deleteAccount",
    });
    return { success: false };
  }
}

/**
 * Updates the user's data.
 *
 * @param {object} data
 * @returns {Promise<boolean>}
 */
export async function updateUser(data) {
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

  console.error({
    error: await response.text(),
    response,
    service: "web",
    pathname: "/api/account",
    component: "updateUser",
  });

  return false;
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
    console.error({
      error,
      service: "web",
      pathname: "/api/data",
      component: "deleteDream",
    });
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
    console.error({
      error,
      service: "web",
      pathname: "/api/data",
      component: "searchDreams",
    });
    return { success: false };
  }
}

export async function createComment(data) {
  const body = JSON.stringify(data);

  try {
    const response = await fetch("/api/data/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });

    const data = await response.json();

    return { success: true, data };
  } catch (error) {
    console.error({
      error,
      service: "web",
      pathname: "/api/data/comments",
      component: "createComment",
    });
    return { success: false };
  }
}

export async function deleteComment(commentId, dreamId) {
  const body = JSON.stringify({ commentId, dreamId });

  try {
    const response = await fetch("/api/data/comments", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body,
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error({
      error,
      service: "web",
      pathname: "/api/data/comments",
      component: "deleteComment",
    });
    return { success: false };
  }
}

export async function createAICompletion(data) {
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
    console.error({
      error,
      service: "web",
      pathname: "/api/data/completions",
      component: "createAICompletion",
    });
    return { success: false };
  }
}

export async function starDream(data) {
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
    console.error({
      error,
      service: "web",
      pathname: "/api/data/stars",
      component: "starDream",
    });
    return { success: false };
  }
}

export async function unstarDream(data) {
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
    console.error({
      error,
      service: "web",
      pathname: "/api/data/stars",
      component: "unstarDream",
    });
    return { success: false };
  }
}

export async function markInboxMessagesAsRead(inboxIds, all = undefined) {
  const body = JSON.stringify({ inboxIds, all });

  try {
    const response = await fetch("/api/data/inbox", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body,
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error({
      error,
      service: "web",
      pathname: "/api/data/inbox",
      component: "markAsRead",
    });
    return { success: false };
  }
}

export async function deleteInboxMessages(inboxIds, all = undefined) {
  const body = JSON.stringify({ inboxIds, all });

  try {
    const response = await fetch("/api/data/inbox", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body,
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error({
      error,
      service: "web",
      pathname: "/api/data/inbox",
      component: "markAsRead",
    });
    return { success: false };
  }
}
