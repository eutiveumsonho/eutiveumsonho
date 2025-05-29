import { logError } from "../o11y/log";

export async function createPost(data) {
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
    logError(error, {
      error,
      service: "api",
      pathname: "/api/data",
      component: "createPost",
    });
    return { success: false };
  }
}

export async function savePost(dreamId, dreamData) {
  const body = JSON.stringify({ dreamId, dreamData });

  try {
    const response = await fetch("/api/data", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body,
    });

    return { success: true, data: response };
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data",
      component: "savePost",
    });
    return { success: false };
  }
}

export async function updatePostVisibility(postId, visibility) {
  const body = JSON.stringify({ dreamId: postId, visibility });

  try {
    const response = await fetch("/api/data/publish", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body,
    });

    return { success: true, data: response };
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data/publish",
      component: "updatePostVisibility",
    });
    return { success: false };
  }
}

export async function deletePost(postId) {
  const body = JSON.stringify({ dreamId: postId });

  try {
    const response = await fetch("/api/data", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body,
    });

    const data = await response.json();

    return data;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data",
      component: "deletePost",
    });
    return { success: false };
  }
}

export async function searchPosts(query) {
  try {
    const response = await fetch(`/api/data?query=${encodeURI(query)}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
    });

    const data = await response.json();

    return data;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data",
      component: "searchPosts",
    });
    return { success: false };
  }
}

export async function exportDreamsToEmail(locale = 'en') {
  try {
    const response = await fetch(`/api/data/export?locale=${locale}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
    });

    const data = await response.json();

    return { success: true, data };
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data/export",
      component: "exportDreamsToEmail",
    });
    return { success: false };
  }
}
