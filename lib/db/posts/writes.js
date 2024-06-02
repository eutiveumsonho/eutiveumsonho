import { ObjectID } from "bson";
import { getInsights } from "../../insights";
import {
  getCommentsCollection,
  getPostsCollection,
  getStarsCollection,
} from "../../mongodb";
import { encryptPost } from "../../security/transformations";
import { getPostById, getUserByEmail, hasAiCommentedOnPost } from "../reads";
import { isPostOwner } from "../../validations";
import { generateCompletion } from "../writes";

/**
 * Method responsible for creating a post.
 * It encrypts the post if it's private.
 * It generates insights from the post text (word frequency and character count).
 *
 * This method is only called from the frontend the first time a post is synced.
 * The subsequent times, the post is updated.
 */
export async function createPost(data) {
  const { dream: postData, session } = data;

  const [user, collection] = await Promise.all([
    getUserByEmail(session.user.email),
    getPostsCollection(),
  ]);

  const insights = getInsights(postData.dream.text);

  const encryptedPost = encryptPost(postData.dream);

  const result = await collection.insertOne({
    dream: encryptedPost,
    userId: ObjectID(user._id),
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    visibility: "private",
    commentCount: 0,
    starCount: 0,
    ...insights,
  });

  return result;
}

/**
 * Updates a post, auto-saving it.
 * It encrypts the post if it's private before updating it.
 * It also updates insights from the post text (word frequency and character count).
 */
export async function updatePost(postId, rawPostData, userEmail) {
  const [collection, user, postData] = await Promise.all([
    getPostsCollection(),
    getUserByEmail(userEmail),
    getPostById(postId),
  ]);

  if (!isPostOwner(postData, user)) {
    console.warn("User is not the publication owner");

    return null;
  }

  let possiblyUpdatedPost = rawPostData.dream;
  const insights = getInsights(rawPostData.dream.text);

  if (postData.visibility === "private") {
    possiblyUpdatedPost = encryptPost(rawPostData.dream);
  }

  const result = await collection.updateOne(
    {
      _id: ObjectID(postId),
    },
    {
      $set: {
        dream: possiblyUpdatedPost,
        ...insights,
        lastUpdatedAt: new Date().toISOString(),
      },
    }
  );

  return result;
}

/**
 * Method responsible for updating a dream's visibility.
 * In case a dream is going from public to private and doesn't
 * have an AI input, it also generates one.
 *
 * @param {string} postId - The dream's ID
 * @param {string} visibility - "public" or "private"
 * @param {string} userEmail - The dream owner user's email
 * @returns {Promise<{ success: boolean }>}
 */
export async function updatePostVisibility(postId, visibility, userEmail) {
  const [collection, user, postData] = await Promise.all([
    getPostsCollection(),
    getUserByEmail(userEmail),
    getPostById(postId),
  ]);

  if (!isPostOwner(postData, user)) {
    return null;
  }

  if (postData.visibility !== "private" && visibility !== "private") {
    const result = await collection.updateOne(
      {
        _id: ObjectID(postId),
      },
      {
        $set: { visibility, lastUpdatedAt: new Date().toISOString() },
      }
    );

    return result;
  }

  if (postData.visibility === "private" && visibility !== "private") {
    // TODO: Completion generation should come from a callback
    const hasCommented = await hasAiCommentedOnPost(postId);

    if (!hasCommented) {
      console.log("Generating completion from workflow #3");
      await generateCompletion(
        postId,
        postData.dream.text,
        undefined,
        user._id
      );
    }

    const result = await collection.updateOne(
      {
        _id: ObjectID(postId),
      },
      {
        $set: {
          // At this point the post is already decrypted, see getPostById
          dream: postData.dream,
          visibility,
          lastUpdatedAt: new Date().toISOString(),
        },
      }
    );

    return result;
  }

  const encryptedPost = encryptPost(postData.dream);

  const result = await collection.updateOne(
    {
      _id: ObjectID(postId),
    },
    {
      $set: {
        dream: encryptedPost,
        visibility,
        lastUpdatedAt: new Date().toISOString(),
      },
    }
  );

  return result;
}

/**
 * Method responsible for deleting a post
 *
 * @param {string} postId - The post id
 * @returns {Promise<{ success: boolean }>}
 */
export async function deletePost(postId) {
  const [collection, commentsCollection, starsCollection] = await Promise.all([
    getPostsCollection(),
    getCommentsCollection(),
    getStarsCollection(),
  ]);

  try {
    await Promise.all([
      collection.deleteOne({
        _id: ObjectID(postId),
      }),
      commentsCollection.deleteMany({
        dreamId: ObjectID(postId),
      }),
      starsCollection.deleteMany({
        dreamId: ObjectID(postId),
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error({ error, service: "db", component: "deletePost" });
    return { success: false };
  }
}
