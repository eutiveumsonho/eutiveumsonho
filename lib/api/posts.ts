import { logError } from "../o11y/log";
import { PostVisibility } from "../posts/types";

/**
 * Creates a new post.
 */
export async function createPost(data: Record<string, any>) {
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

/**
 * Updates an existing post.
 */
export async function savePost(postId: string, postData: Record<string, any>) {
  const body = JSON.stringify({ dreamId: postId, dreamData: postData });

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

export async function updatePostVisibility(
  postId: string,
  visibility: PostVisibility
) {
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

export async function deletePost(postId: string) {
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

export async function searchPosts(query: string) {
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
