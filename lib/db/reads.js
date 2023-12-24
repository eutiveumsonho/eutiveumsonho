import { ObjectID } from "bson";
import {
  getCommentsCollection,
  getDreamsCollection,
  getInboxCollection,
  getStarsCollection,
  getUsersCollection,
} from "../mongodb";
import { decryptDream } from "../transformations";

/**
 * Get a dream by its id and optionally filter the results
 *
 * @param {string} dreamId The dream id
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
    console.error({
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
    console.error({
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

/**
 * Gets a comment on a publication by its id
 *
 * @param {string} commentId The comment id
 */
export async function getCommentById(commentId) {
  const collection = await getCommentsCollection();

  const cursor = collection.find({ _id: ObjectID(commentId) }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }

  const data = result[0];

  return data;
}

/**
 * Gets a star from a specific publication by its id
 *
 * @param {string} userEmail The user email
 * @param {string} postId The publication id
 */
export async function getStar(userEmail, postId) {
  const collection = await getStarsCollection();

  const cursor = collection
    .find({ userEmail: userEmail, dreamId: ObjectID(postId) })
    .limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }

  const data = result[0];

  return data;
}

/**
 * Checks whether a user has commented on a post or not
 *
 * @param {string} userName The user name
 * @param {string} postId The post id
 * @returns {Promise<boolean>}
 */
export async function hasCommentedOnDream(userName, postId) {
  const collection = await getCommentsCollection();

  return (
    (await collection
      .find({ userName: userName, dreamId: ObjectID(postId) })
      .count()) > 0
  );
}

/**
 * Checks if the AI has commented on a dream
 *
 * @param {string} postId The post id
 * @returns {Promise<boolean>}
 */
export async function hasAiCommentedOnDream(postId) {
  const [hasCommented, legacyHasCommented] = await Promise.all([
    hasCommentedOnDream("Sonia", postId),
    hasCommentedOnDream("Sonio", postId),
  ]);

  return hasCommented || legacyHasCommented;
}
