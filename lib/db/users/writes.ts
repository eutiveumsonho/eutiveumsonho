import { ObjectId } from "bson";
import { Collection, UpdateResult } from "mongodb";
import { getUsersCollection } from "../mongodb";
import { User } from "./reads";

/**
 * Updates a user's account with the provided data.
 *
 * @param {string} userId The user ID to update
 * @param {Partial<User>} data The data to update the user with
 * @returns {Promise<UpdateResult>} The result of the update operation
 */
export async function updateUser(userId: string, data: Partial<User>): Promise<UpdateResult> {
  const collection: Collection = await getUsersCollection();

  const result = await collection.updateOne(
    {
      _id: new new ObjectId(userId),
    },
    {
      $set: {
        ...data,
      },
    }
  );

  return result;
}