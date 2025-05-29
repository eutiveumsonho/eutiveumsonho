import { isUsernameAvailable } from "../../../lib/db/profiles/reads";
import { logError } from "../../../lib/o11y/log";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ 
      available: false, 
      error: "Username must be between 3 and 30 characters" 
    });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(400).json({ 
      available: false, 
      error: "Username can only contain letters, numbers, hyphens, and underscores" 
    });
  }

  try {
    const available = await isUsernameAvailable(username);
    return res.status(200).json({ available });
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/profile/check-username",
      method: "POST",
    });

    return res.status(500).json({ error: "Internal server error" });
  }
}