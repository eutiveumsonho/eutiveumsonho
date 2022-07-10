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
