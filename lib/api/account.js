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
