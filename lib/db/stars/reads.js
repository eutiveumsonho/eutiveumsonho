import { ObjectID } from "bson";
import { getStarsCollection } from "../../mongodb";
import { getPostById } from "../reads";

export async function getStars(postId) {
  const [collection, post] = await Promise.all([
    getStarsCollection(),
    getPostById(postId),
  ]);

  if (!post) {
    console.error({
      name: "Post miss",
      message: "No post found to star",
    });

    return;
  }

  const cursor = collection
    .find({ dreamId: ObjectID(postId) })
    .sort({ _id: 1 });

  const result = await cursor.toArray();

  if (result.lenght === 0) {
    return null;
  }

  return result;
}

/**
 * Gets all the stars from a user
 *
 * @param {string} userEmail The user email
 */
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
 * Gets all the starred posts from a user
 *
 * @param {string} userEmail The user email
 */
export async function getStarredPosts(userEmail) {
  const stars = await getStarsByUserEmail(userEmail);

  const posts = await Promise.all(
    stars.map((star) => getPostById(star.dreamId))
  );

  if (posts.lenght === 0) {
    return null;
  }

  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
