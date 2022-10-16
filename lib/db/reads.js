import { ObjectID } from "bson";
import {
  getCommentsCollection,
  getDreamsCollection,
  getInboxCollection,
  getStarsCollection,
  getUsersCollection,
} from "../mongodb";
import { logError } from "../o11y";
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
    .limit(200);

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
 * @private
 */
export async function getDreamRecords(userEmail) {
  const [user, collection] = await Promise.all([
    getUserByEmail(userEmail),
    getDreamsCollection(),
  ]);

  const cursor = collection
    .find({ userId: ObjectID(user._id) })
    .sort({ _id: -1 })
    .limit(200);

  const rawResult = await cursor.toArray();

  await cursor.close();

  if (rawResult.lenght === 0) {
    return null;
  }

  const result = [];

  for (let data of rawResult) {
    result.push({
      createdAt: data.createdAt,
      dreamId: data._id,
      wordFrequency: data.wordFrequency,
      characterCount: data.characterCount,
    });
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
    .limit(200);

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
            fuzzy: {
              maxExpansions: 10,
              prefixLength: 3,
            },
            path: "dream.text",
          },
        },
      },
    ])
    .toArray();

  return result;
}

export async function getComments(dreamId) {
  const [collection, dream] = await Promise.all([
    getCommentsCollection(),
    getDreamById(dreamId),
  ]);

  if (!dream) {
    logError({
      name: "Dream miss",
      message: "No dream found to append comment",
    });

    return;
  }

  const cursor = collection
    .find({ dreamId: ObjectID(dreamId) })
    .sort({ _id: 1 });

  const result = await cursor.toArray();

  if (result.lenght === 0) {
    return null;
  }

  return result;
}

export async function getCommentsByUserId(userId) {
  const collection = await getCommentsCollection();

  const cursor = collection
    .find({ userId: ObjectID(userId) })
    .sort({ _id: -1 });

  const result = await cursor.toArray();

  if (result.lenght === 0) {
    return null;
  }

  return result;
}

export async function getStars(dreamId) {
  const [collection, dream] = await Promise.all([
    getStarsCollection(),
    getDreamById(dreamId),
  ]);

  if (!dream) {
    logError({
      name: "Dream miss",
      message: "No dream found to star",
    });

    return;
  }

  const cursor = collection
    .find({ dreamId: ObjectID(dreamId) })
    .sort({ _id: 1 });

  const result = await cursor.toArray();

  if (result.lenght === 0) {
    return null;
  }

  return result;
}

export async function getStarsByUserEmail(userEmail) {
  const collection = await getStarsCollection();

  const cursor = collection.find({ userEmail }).sort({ _id: -1 });

  const result = await cursor.toArray();

  if (result.lenght === 0) {
    return null;
  }

  return result;
}

/**
 * @private
 */
export async function getStarredDreams(userEmail) {
  const stars = await getStarsByUserEmail(userEmail);

  const dreams = await Promise.all(
    stars.map((star) => getDreamById(star.dreamId))
  );

  if (dreams.lenght === 0) {
    return null;
  }

  return dreams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

/**
 * @private
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
 * @private
 */
export async function getInboxCount(userEmail) {
  const collection = await getInboxCollection();

  const result = await collection
    .find({ dreamOwnerUserEmail: userEmail, read: false })
    .count();

  return result;
}
