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
