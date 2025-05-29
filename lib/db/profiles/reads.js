import { ObjectID } from "bson";
import { getUsersCollection } from "../mongodb";

/**
 * Gets a user's profile by their username
 *
 * @param {string} username The username
 */
export async function getProfileByUsername(username) {
  const collection = await getUsersCollection();

  const cursor = collection.find({ username }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.length === 0) {
    return null;
  }

  const user = result[0];

  // Only return public profiles or return null if private
  if (!user.profileVisibility || user.profileVisibility === "private") {
    return null;
  }

  // Return only public profile data
  return {
    _id: user._id,
    username: user.username,
    name: user.name,
    image: user.image,
    profileVisibility: user.profileVisibility,
    createdAt: user.emailVerified, // Use emailVerified as proxy for account creation
  };
}

/**
 * Gets a user's profile by their user ID (for own profile viewing)
 *
 * @param {string} userId The user ID
 */
export async function getProfileByUserId(userId) {
  const collection = await getUsersCollection();

  const cursor = collection.find({ _id: ObjectID(userId) }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.length === 0) {
    return null;
  }

  const user = result[0];

  // Return full profile data for own profile
  return {
    _id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    image: user.image,
    profileVisibility: user.profileVisibility || "private",
    createdAt: user.emailVerified,
  };
}

/**
 * Check if a username is available
 *
 * @param {string} username The username to check
 * @param {string} excludeUserId Exclude this user ID from the check (for updates)
 */
export async function isUsernameAvailable(username, excludeUserId = null) {
  const collection = await getUsersCollection();

  const query = { username: username.toLowerCase() };
  
  if (excludeUserId) {
    query._id = { $ne: ObjectID(excludeUserId) };
  }

  const cursor = collection.find(query).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  return result.length === 0;
}