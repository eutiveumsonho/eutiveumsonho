import { ObjectID } from "bson";
import { getDreamsCollection, getUsersCollection } from "../mongodb";
import { decryptDream } from "../transformations";

/**
 * @private
 */
export async function getDreamById(dreamId) {
  const collection = await getDreamsCollection();

  const cursor = collection.find({ _id: ObjectID(dreamId) }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }

  const data = result[0];

  if (data.visibility === "private") {
    const decryptedDream = decryptDream(data.dream);

    return {
      ...data,
      dream: decryptedDream,
    };
  }

  return data;
}

/**
 * @private
 */
export async function getDreams(userEmail) {
  const [user, collection] = await Promise.all([
    getUserByEmail(userEmail),
    getDreamsCollection(),
  ]);

  const cursor = collection
    .find({ userId: ObjectID(user._id) })
    .sort({ _id: -1 })
    .limit(10);

  const rawResult = await cursor.toArray();

  await cursor.close();

  if (rawResult.lenght === 0) {
    return null;
  }

  const result = [];

  for (let data of rawResult) {
    if (data.visibility === "private") {
      data = {
        ...data,
        dream: decryptDream(data.dream),
      };
    }

    result.push(data);
  }

  return result;
}

/**
 * @public
 */
export async function getLatestPublicDreams() {
  const collection = await getDreamsCollection();

  const cursor = collection
    .find({ visibility: { $in: ["public", "anonymous"] } })
    .sort({ _id: -1 })
    .limit(10);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }

  return result;
}

/**
 * @public
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
 * @public
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

export async function searchDreams(query) {
  const collection = await getDreamsCollection();

  const result = await collection
    .aggregate([
      {
        $search: {
          index: "default",
          text: {
            query,
            path: "dream.text",
          },
        },
      },
    ])
    .toArray();

  return result;
}
