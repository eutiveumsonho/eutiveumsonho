import { ObjectID } from "bson";
import { getUsersCollection } from "../mongodb";

/**
 * Updates a user's profile information
 *
 * @param {string} userId The user ID
 * @param {object} profileData The profile data to update
 */
export async function updateProfile(userId, profileData) {
  const collection = await getUsersCollection();

  const updateData = {};

  if (profileData.username !== undefined) {
    updateData.username = profileData.username.toLowerCase();
  }

  if (profileData.name !== undefined) {
    updateData.name = profileData.name;
  }

  if (profileData.profileVisibility !== undefined) {
    updateData.profileVisibility = profileData.profileVisibility;
  }

  const result = await collection.updateOne(
    {
      _id: ObjectID(userId),
    },
    {
      $set: updateData,
    }
  );

  return result;
}

/**
 * Set username for a user (for new user registration)
 *
 * @param {string} userId The user ID
 * @param {string} username The username
 */
export async function setUsername(userId, username) {
  const collection = await getUsersCollection();

  const result = await collection.updateOne(
    {
      _id: ObjectID(userId),
    },
    {
      $set: {
        username: username.toLowerCase(),
        profileVisibility: "private", // Default to private
      },
    }
  );

  return result;
}