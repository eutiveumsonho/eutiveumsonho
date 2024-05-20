import { ObjectID } from "bson";
import {
  getAccountsCollection,
  getCommentsCollection,
  getPostsCollection,
  getStarsCollection,
  getUsersCollection,
} from "../../mongodb";
import {
  getCommentsByUserId,
  getStarsByUserEmail,
  getUserByEmail,
} from "../reads";
import { deleteComment } from "../writes";
import { unstarPost } from "../stars/writes";

/**
 * Method responsible for deleting a user's account.
 * This method is called when a user deletes their account.
 * It deletes all dreams, comments and stars related to the user, and the user's account.
 *
 * @param {string} userEmail - The user's email
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteAccount(userEmail) {
  const [
    user,
    usersCollection,
    postsCollection,
    accountsCollection,
    commentsCollection,
    starsCollection,
  ] = await Promise.all([
    getUserByEmail(userEmail),
    getUsersCollection(),
    getPostsCollection(),
    getAccountsCollection(),
    getCommentsCollection(),
    getStarsCollection(),
  ]);

  if (!user) {
    console.warn({
      message: "No user found",
      service: "db",
      pathname: "deleteAccount",
    });
    return { success: false };
  }

  try {
    const comments = await getCommentsByUserId(user._id);
    const stars = await getStarsByUserEmail(user.email);

    await Promise.all([
      postsCollection.deleteMany({ userId: ObjectID(user._id) }),
      accountsCollection.deleteOne({ userId: ObjectID(user._id) }),
      usersCollection.deleteOne({ email: userEmail }),
      // Delete all comments made on this user's posts.
      commentsCollection.deleteMany({ dreamOwnerUserId: ObjectID(user._id) }),
      // Delete all stars given to this user's posts.
      starsCollection.deleteMany({ dreamOwnerUserId: ObjectID(user._id) }),
    ]);

    // Delete comments made on other people's posts and
    // decrement the dream count accordingly.
    for (const comment of comments) {
      // Skip awaiting, update as many dream comment counts
      // as possible as fast as possible.
      deleteComment(comment._id, comment.dreamId);
    }

    for (const star of stars) {
      unstarPost(star._id, star.dreamId);
    }

    return { success: true };
  } catch (error) {
    console.error({ error, service: "db", component: "deleteAccount" });
    return { success: false };
  }
}
