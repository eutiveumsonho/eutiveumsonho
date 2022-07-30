import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

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
  const session = await getSession();

  if (!session) {
    return { success: false };
  }

  console.log({ data, session });

  const body = JSON.stringify({ ...data, sessId: session.user.email });

  try {
    await fetch("/api/data", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function saveDream(data) {
  const session = await getSession();
  const router = useRouter();
  console.log({ router });

  if (!session) {
    return { success: false };
  }

  const body = JSON.stringify({ ...data, sessId: session.user.email });

  try {
    await fetch("/api/data", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
