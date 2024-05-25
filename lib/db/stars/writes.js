import { ObjectID } from "bson";
import {
  getInboxCollection,
  getPostsCollection,
  getStarsCollection,
} from "../../mongodb";
import { getPostById, getUserByEmail, getUserById } from "../reads";
import { getStar } from "./reads";
import { v4 as uuid } from "uuid";

/**
 * This method is responsible for starring a post.
 * It also creates an inbox message for the post owner.
 * If the post owner is the same as the user, no inbox message is created.
 *
 * @param {object} data - The data object
 * @param {string} data.postId - The post ID
 * @param {object} data.session - The session object
 * @param {object} data.session.user - The user object
 * @param {string} data.session.user.name - The user's name
 * @param {string} data.session.user.email - The user's email
 * @param {string} data.session.user.image - The user's image
 * @returns {Promise<{ insertedId: string }>}
 */
export async function starPost(data) {
  const { dreamId: postId, session } = data;

  const [user, collection, inboxCollection] = await Promise.all([
    getUserByEmail(session.user.email),
    getStarsCollection(),
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
      inboxKey: shouldCreateNewInbox ? inboxKey : null,
    }),
    // The only difference between the inbox
    // and the stars collection, is that
    // the inbox collection is ephemeral
    shouldCreateNewInbox
      ? inboxCollection.insertOne({
          userId: ObjectID(user._id),
          userName: user.name,
          userEmail: user.email,
          userImage: user.image,
          dreamId: ObjectID(postId),
          dreamOwnerUserEmail: postOwner.email,
          createdAt: new Date().toISOString(),
          type: "star",
          read: false,
          starKey: inboxKey,
        })
      : () => null,
  ]);

  if (result.insertedId) {
    const postsCollection = await getPostsCollection();

    await postsCollection.updateOne(
      {
        _id: ObjectID(postId),
      },
      { $inc: { starCount: 1 } }
    );
  }

  return result;
}

/**
 * This method is responsible for unstarring a post.
 */
export async function unstarPost(data) {
  const { dreamId: postId, session } = data;

  const [collection, postsCollection, inboxCollection] = await Promise.all([
    getStarsCollection(),
    getPostsCollection(),
    getInboxCollection(),
  ]);

  const star = await getStar(session.user.email, postId);

  return await Promise.all([
    collection.deleteOne({
      userEmail: session.user.email,
      dreamId: ObjectID(postId),
    }),
    postsCollection.updateOne(
      {
        _id: ObjectID(postId),
      },
      { $inc: { starCount: -1 } }
    ),
    inboxCollection.deleteOne({
      userEmail: session.user.email,
      starKey: star?.inboxKey,
    }),
  ]);
}
