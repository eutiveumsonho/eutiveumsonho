import { ObjectId } from "bson";
import { getStarsCollection } from "../mongodb";
import { getPostById } from "../reads";

export async function getStars(postId: string): Promise<any[] | null> {
  const [collection, post] = await Promise.all([
    getStarsCollection(),
    getPostById(postId),
  ]);

  if (!post) {
    console.error({
      name: "Post miss",
      message: "No post found to star",
    });

    return null;
  }

  const cursor = collection
    .find({ dreamId: new ObjectId(postId) })
    .sort({ _id: 1 });

  const result = await cursor.toArray();

  if (result.length === 0) {
    return null;
  }

  return result;
}

/**
 * Gets all the stars from a user
 *
 * @param {string} userEmail The user email
 */
export async function getStarsByUserEmail(userEmail: string): Promise<any[] | null> {
  const collection = await getStarsCollection();

  const cursor = collection.find({ userEmail }).sort({ _id: -1 });

  const result = await cursor.toArray();

  if (result.length === 0) {
    return null;
  }

  return result;
}

/**
 * Gets all the starred posts from a user
 *
 * @param {string} userEmail The user email
 */
export async function getStarredPosts(userEmail: string): Promise<any[] | null> {
  const stars = await getStarsByUserEmail(userEmail);

  if (!stars) {
    return null;
  }

  const posts = await Promise.all(
    stars.map((star) => getPostById(star.dreamId))
  );

  if (posts.length === 0) {
    return null;
  }

  return posts.sort((a, b) => new Date(b.createdAt).getDate() - new Date(a.createdAt).getDate());
}

/**
 * Gets a star from a specific publication by its id
 *
 * @param {string} userEmail The user email
 * @param {string} postId The publication id
 */
export async function getStar(userEmail: string, postId: string): Promise<any | null> {
  const collection = await getStarsCollection();

  const cursor = collection
    .find({ userEmail: userEmail, dreamId: new ObjectId(postId) })
    .limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.length === 0) {
    return null;
  }

  const data = result[0];

  return data;
}