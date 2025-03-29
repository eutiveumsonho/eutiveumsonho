import { ObjectId } from "bson";
import { Collection } from "mongodb";
import { getUsersCollection } from "../mongodb";

/**
 * Interface representing a User document in the database
 */
export interface User {
  _id: string;
  email: string;
  name?: string;
  image?: string;
  [key: string]: any;
}

/**
 * Gets an user by its email
 *
 * @param {string} userEmail The user email
 * @returns {Promise<User | null>} The user document or null if not found
 */
export async function getUserByEmail(userEmail: string): Promise<User | null> {
  const collection: Collection = await getUsersCollection();

  const cursor = collection.find({ email: userEmail }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  // Fixed the typo in length
  if (result.length === 0) {
    return null;
  }

  return result[0] as User;
}

/**
 * Gets an user by its id
 *
 * @param {string} userId The user id
 * @returns {Promise<User | null>} The user document or null if not found
 */
export async function getUserById(userId: string): Promise<User | null> {
  const collection: Collection = await getUsersCollection();

  const cursor = collection.find({ _id: new new ObjectId(userId) }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  // Fixed the typo in length
  if (result.length === 0) {
    return null;
  }

  return result[0] as User;
}

// TODO: transform this into a searchUsers method
/**
 * Gets all users with pagination
 * 
 * @returns {Promise<User[] | null>} Array of user documents or null if none found
 */
export async function getUsers(): Promise<User[] | null> {
  const collection: Collection = await getUsersCollection();

  const cursor = collection.find({}).sort({ _id: -1 }).limit(200);

  const result = await cursor.toArray();

  await cursor.close();

  // Fixed the typo in length
  if (result.length === 0) {
    return null;
  }
  
  return result as User[];
}