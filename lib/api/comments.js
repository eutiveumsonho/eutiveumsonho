import { logError } from "../o11y/log";

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
    logError(error, {
      service: "api",
      pathname: "/api/data/comments",
      component: "createComment",
    });
    return { success: false };
  }
}

export async function deleteComment(commentId, postId) {
  const body = JSON.stringify({ commentId, dreamId: postId });

  try {
    const response = await fetch("/api/data/comments", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body,
    });

    const data = await response.json();

    return data;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data/comments",
      component: "deleteComment",
    });
    return { success: false };
  }
}
