import { ObjectID } from "bson";
import {
  getCommentsCollection,
  getInboxCollection,
  getPostsCollection,
} from "../mongodb";
import { getPostById, getUserByEmail, getUserById } from "../reads";
import { v4 as uuid } from "uuid";

/**
 * This method is responsible for creating a comment.
 * It also creates an inbox message for the post owner.
 * If the post owner is the same as the user, no inbox message is created.
 * It has a special case for the AI user, which is a bot that creates comments.
 * The AI user doesn't have a database object, so it skips getting the user's database object.
 *
 * @param {object} data - The data object
 * @param {string} data.comment - The comment text
 * @param {string} data.postId - The post ID
 * @param {object} data.session - The session object
 * @param {object} data.session.user - The user object
 * @param {string} data.session.user.name - The user's name
 * @param {string} data.session.user.email - The user's email
 * @param {string} data.session.user.image - The user's image
 * @returns {Promise<{ insertedId: string }>}
 */
export async function createComment(data) {
  const { comment, dreamId: postId, session } = data;

  // Skip getting user's database object because it doesn't really exist.
  const isAIComment = session.user.name === "Sonia";

  if (isAIComment) {
    const [collection, inboxCollection] = await Promise.all([
      getCommentsCollection(),
      getInboxCollection(),
    ]);

    const post = await getPostById(postId);
    const postOwner = await getUserById(post.userId);

    const inboxKey = uuid();

    const [result, _] = await Promise.all([
      collection.insertOne({
        // Grab the user's name from the mocked session.
        userId: session.user.name,
        userName: session.user.name,
        userEmail: session.user.email,
        userImage: session.user.image,
        dreamId: ObjectID(postId),
        dreamOwnerUserId: ObjectID(post.userId),
        createdAt: new Date().toISOString(),
        text: comment,
        inboxKey,
      }),
      inboxCollection.insertOne({
        userId: session.user.name,
        userName: session.user.name,
        userEmail: session.user.email,
        userImage: session.user.image,
        dreamId: ObjectID(postId),
        dreamOwnerUserEmail: postOwner.email,
        createdAt: new Date().toISOString(),
        type: "comment",
        read: false,
        commentKey: inboxKey,
      }),
    ]);

    if (result.insertedId) {
      const postsCollection = await getPostsCollection();

      await postsCollection.updateOne(
        {
          _id: ObjectID(postId),
        },
        { $inc: { commentCount: 1 } }
      );
    }

    return result;
  }

  if (!isAIComment) {
    const [user, collection, inboxCollection] = await Promise.all([
      getUserByEmail(session.user.email),
      getCommentsCollection(),
      getInboxCollection(),
    ]);

    const post = await getPostById(postId);
    const postOwner = await getUserById(post.userId);

    let shouldCreateNewInbox = true;
    if (postOwner.email === user.email) {
      shouldCreateNewInbox = false;
    }

    const inboxKey = uuid();

    const [result, _] = await Promise.all([
      collection.insertOne({
        userId: ObjectID(user._id),
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
        dreamId: ObjectID(postId),
        dreamOwnerUserId: ObjectID(post.userId),
        createdAt: new Date().toISOString(),
        text: comment,
        inboxKey: shouldCreateNewInbox ? inboxKey : null,
      }),
      shouldCreateNewInbox
        ? inboxCollection.insertOne({
            userId: ObjectID(user._id),
            userName: user.name,
            userEmail: user.email,
            userImage: user.image,
            dreamId: ObjectID(postId),
            dreamOwnerUserEmail: postOwner.email,
            createdAt: new Date().toISOString(),
            type: "comment",
            read: false,
            commentKey: inboxKey,
          })
        : () => null,
    ]);

    if (result.insertedId) {
      const postsCollection = await getPostsCollection();

      await postsCollection.updateOne(
        {
          _id: ObjectID(postId),
        },
        { $inc: { commentCount: 1 } }
      );
    }

    return result;
  }
}

/**
 * This method is responsible for deleting a comment from a post.
 * It also deletes the inbox message for the post owner.
 *
 * @param {string} commentId - The comment ID
 * @param {string} postId - The post ID
 * @returns {Promise<any>}
 */
export async function deleteComment(commentId, postId) {
  const [collection, postsCollection, inboxCollection] = await Promise.all([
    getCommentsCollection(),
    getPostsCollection(),
    getInboxCollection(),
  ]);

  const comment = await getCommentById(commentId);

  return await Promise.all([
    collection.deleteOne({ _id: ObjectID(commentId) }),
    postsCollection.updateOne(
      {
        _id: ObjectID(postId),
      },
      { $inc: { commentCount: -1 } }
    ),
    inboxCollection.deleteOne({
      userEmail: session.user.email,
      commentKey: comment?.inboxKey,
    }),
  ]);
}
