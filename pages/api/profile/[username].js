import { getProfileByUsername } from "../../../lib/db/profiles/reads";
import { logError } from "../../../lib/o11y/log";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const profile = await getProfileByUsername(username);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found or private" });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/profile/[username]",
      method: "GET",
    });

    return res.status(500).json({ error: "Internal server error" });
  }
}