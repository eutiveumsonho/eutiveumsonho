import { ObjectID } from "bson";
import { getUsersCollection } from "../mongodb";

/**
 * Gets an user by its email
 *
 * @param {string} userEmail The user email
 */
export async function getUserByEmail(userEmail) {
  const collection = await getUsersCollection();

  const cursor = collection.find({ email: userEmail }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }

  return result[0];
}

/**
 * Gets an user by its id
 *
 * @param {userId} userId The user id
 */
export async function getUserById(userId) {
  const collection = await getUsersCollection();

  const cursor = collection.find({ _id: ObjectID(userId) }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }

  return result[0];
}

// TODO: transform this into a searchUsers method
export async function getUsers() {
  const collection = await getUsersCollection();

  const cursor = collection.find({}).sort({ _id: -1 }).limit(200);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }
}
