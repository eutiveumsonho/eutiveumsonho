import { getInboxCollection } from "../../mongodb";

/**
 * Gets the inbox data of a user
 *
 * @param {string} userEmail The user email
 */
export async function getInbox(userEmail) {
  const collection = await getInboxCollection();

  const cursor = collection
    .find({ dreamOwnerUserEmail: userEmail })
    .sort({ _id: -1 });

  const result = await cursor.toArray();

  if (result.lenght === 0) {
    return null;
  }

  return result;
}

/**
 * Gets the count of unread messages in the inbox
 *
 * @param {string} userEmail The user email
 */
export async function getInboxCount(userEmail) {
  const collection = await getInboxCollection();

  const result = await collection
    .find({ dreamOwnerUserEmail: userEmail, read: false })
    .count();

  return result;
}
