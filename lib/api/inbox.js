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
