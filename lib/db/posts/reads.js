import { ObjectID } from "bson";
import { getPostsCollection } from "../mongodb";
import { decryptPost } from "../../security/transformations";
import { getUserByEmail } from "../reads";
import { logError } from "../../o11y/log";

/**
 * Get a post by its id and optionally filter the results
 *
 * @param {string} postId The post id
 */
export async function getPostById(postId) {
  const collection = await getPostsCollection();

  const cursor = collection.find({ _id: ObjectID(postId) }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }

  const data = result[0];

  if (data.visibility === "private") {
    const decryptedPost = decryptPost(data.dream);

    return {
      ...data,
      dream: decryptedPost,
    };
  }

  return data;
}

/**
 * Get all the posts from a user
 *
 * @param {string} userEmail The user email
 * @param {Object} options Pagination options
 * @param {number} options.page Page number (1-based)
 * @param {number} options.limit Number of posts per page
 */
export async function getPosts(userEmail, options = {}) {
  try {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [user, collection] = await Promise.all([
      getUserByEmail(userEmail),
      getPostsCollection(),
    ]);

    const cursor = collection
      .find({ userId: ObjectID(user._id) })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    const rawResult = await cursor.toArray();

    await cursor.close();

    if (rawResult.length === 0) {
      return null;
    }

    const result = [];

    for (let data of rawResult) {
      if (data.visibility === "private") {
        data = {
          ...data,
          dream: decryptPost(data.dream),
        };
      }

      result.push(data);
    }

    return result;
  } catch (error) {
    logError(error, {
      component: "getPosts",
      service: "db",
    });

    console.error(error);

    return [];
  }
}

/**
 * Gets the insights from the posts of a user
 *
 * @param {string} userEmail The user email
 */
export async function getPostsInsights(userEmail) {
  const [user, collection] = await Promise.all([
    getUserByEmail(userEmail),
    getPostsCollection(),
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
 * Gets the latest public posts from a user
 *
 * @param {Object} options Pagination options
 * @param {number} options.page Page number (1-based)
 * @param {number} options.limit Number of posts per page
 */
export async function getLatestPublicPosts(options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const collection = await getPostsCollection();

  const cursor = collection
    .find({ visibility: { $in: ["public", "anonymous"] } })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.length === 0) {
    return null;
  }

  return result;
}

/**
 * Get total count of posts for a user
 *
 * @param {string} userEmail The user email
 */
export async function getPostsCount(userEmail) {
  try {
    const [user, collection] = await Promise.all([
      getUserByEmail(userEmail),
      getPostsCollection(),
    ]);

    const count = await collection.countDocuments({ userId: ObjectID(user._id) });

    return count;
  } catch (error) {
    logError(error, {
      component: "getPostsCount",
      service: "db",
    });

    console.error(error);

    return 0;
  }
}

/**
 * Get total count of public posts
 */
export async function getPublicPostsCount() {
  try {
    const collection = await getPostsCollection();

    const count = await collection.countDocuments({ 
      visibility: { $in: ["public", "anonymous"] } 
    });

    return count;
  } catch (error) {
    logError(error, {
      component: "getPublicPostsCount",
      service: "db",
    });

    console.error(error);

    return 0;
  }
}

/**
 * Fuzzy searches posts from all users given a query
 *
 * @param {string} query
 */
export async function searchPosts(query) {
  const collection = await getPostsCollection();

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
