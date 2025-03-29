import { logError } from "../o11y/log";

interface PostResponse {
  success: boolean;
  data?: any;
}

interface DreamData {
  html?: string;
  text?: string;
  [key: string]: any;
}

export async function createPost(data: any): Promise<PostResponse> {
  const body = JSON.stringify(data);
  try {
    const response = await fetch("/api/data", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
    const responseData = await response.json();
    return { success: true, data: responseData };
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

export async function savePost(dreamId: string, dreamData: DreamData): Promise<PostResponse> {
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

export async function updatePostVisibility(postId: string, visibility: string): Promise<PostResponse> {
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

export async function deletePost(postId: string): Promise<PostResponse | any> {
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

export async function searchPosts(query: string | string[]): Promise<any> {
  try {
    const response = await fetch(`/api/data?query=${encodeURI(query.toString())}`, {
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