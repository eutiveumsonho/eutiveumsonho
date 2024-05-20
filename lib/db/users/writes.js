import { ObjectID } from "bson";
import { getUsersCollection } from "../../mongodb";

/**
 * Updates a user's account with the provided data.
 *
 * @param {string} userId
 * @param {object} data
 */
export async function updateUser(userId, data) {
  const collection = await getUsersCollection();

  const result = await collection.updateOne(
    {
      _id: ObjectID(userId),
    },
    {
      $set: {
        ...data,
      },
    }
  );

  return result;
}
