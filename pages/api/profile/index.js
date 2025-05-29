import { getServerSession } from "../../../lib/auth";
import { authOptions } from "../auth/[...nextauth]";
import { getProfileByUserId } from "../../../lib/db/profiles/reads";
import { updateProfile } from "../../../lib/db/profiles/writes";
import { isUsernameAvailable } from "../../../lib/db/profiles/reads";
import { getUserByEmail } from "../../../lib/db/reads";
import { logError } from "../../../lib/o11y/log";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.method === "GET") {
      const profile = await getProfileByUserId(user._id);
      return res.status(200).json({ profile });
    }

    if (req.method === "PUT") {
      const { username, name, profileVisibility } = req.body;

      // Validate input
      if (username && (username.length < 3 || username.length > 30)) {
        return res.status(400).json({ error: "Username must be between 3 and 30 characters" });
      }

      if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
        return res.status(400).json({ error: "Username can only contain letters, numbers, hyphens, and underscores" });
      }

      if (name && name.length > 100) {
        return res.status(400).json({ error: "Name must be less than 100 characters" });
      }

      if (profileVisibility && !["public", "private"].includes(profileVisibility)) {
        return res.status(400).json({ error: "Profile visibility must be 'public' or 'private'" });
      }

      // Check username availability if username is being changed
      if (username) {
        const isAvailable = await isUsernameAvailable(username, user._id);
        if (!isAvailable) {
          return res.status(409).json({ error: "Username is already taken" });
        }
      }

      // Update profile
      const updateData = {};
      if (username !== undefined) updateData.username = username;
      if (name !== undefined) updateData.name = name;
      if (profileVisibility !== undefined) updateData.profileVisibility = profileVisibility;

      await updateProfile(user._id, updateData);

      // Return updated profile
      const updatedProfile = await getProfileByUserId(user._id);
      return res.status(200).json({ profile: updatedProfile });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/profile",
      method: req.method,
    });

    return res.status(500).json({ error: "Internal server error" });
  }
}