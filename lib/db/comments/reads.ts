import { ObjectId } from "bson";
import { getCommentsCollection } from "../mongodb";
import { getPostById } from "../reads";

/**
 * Gets all the comments from a publication
 *
 * @param {string} postId
 */
export async function getComments(postId: string): Promise<any[] | null> {
  const [collection, post] = await Promise.all([
    getCommentsCollection(),
    getPostById(postId),
  ]);

  if (!post) {
    console.error({
      name: "Post miss",
      message: "No publication found to append comment",
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
 * Gets all the comments from a user
 *
 * @param {string} userId
 */
export async function getCommentsByUserId(userId: string): Promise<any[] | null> {
  const collection = await getCommentsCollection();

  const cursor = collection
    .find({ userId: new ObjectId(userId) })
    .sort({ _id: -1 });

  const result = await cursor.toArray();

  if (result.length === 0) {
    return null;
  }

  return result;
}

/**
 * Gets a comment on a publication by its id
 *
 * @param {string} commentId The comment id
 */
export async function getCommentById(commentId: string): Promise<any | null> {
  const collection = await getCommentsCollection();

  const cursor = collection.find({ _id: new ObjectId(commentId) }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.length === 0) {
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
export async function hasCommentedOnPost(userName: string, postId: string): Promise<boolean> {
  const collection = await getCommentsCollection();

  return (
    (await collection
      .find({ userName: userName, dreamId: new ObjectId(postId) })
      .count()) > 0
  );
}