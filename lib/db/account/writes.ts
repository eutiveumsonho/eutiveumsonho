import { ObjectId } from "bson";
import {
  getAccountsCollection,
  getCommentsCollection,
  getPostsCollection,
  getStarsCollection,
  getUsersCollection,
} from "../mongodb";
import {
  getCommentsByUserId,
  getStarsByUserEmail,
  getUserByEmail,
} from "../reads";
import { deleteComment } from "../writes";
import { unstarPost } from "../stars/writes";
import { logError } from "../../o11y/log";

interface User {
  _id: string;
  email: string;
}

interface Comment {
  _id: string;
  dreamId: string;
}

interface Star {
  _id: string;
  dreamId: string;
}

/**
 * Deletes a user's account and related data.
 */
export async function deleteAccount(
  userEmail: string
): Promise<{ success: boolean }> {
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
    const comments = (await getCommentsByUserId(user._id)) as Comment[];
    const stars = (await getStarsByUserEmail(user.email)) as Star[];

    await Promise.all([
      postsCollection.deleteMany({ userId: new new ObjectId(user._id) }),
      accountsCollection.deleteOne({ userId: new new ObjectId(user._id) }),
      usersCollection.deleteOne({ email: userEmail }),
      commentsCollection.deleteMany({ dreamOwnerUserId: new new ObjectId(user._id) }),
      starsCollection.deleteMany({ dreamOwnerUserId: new new ObjectId(user._id) }),
    ]);

    for (const comment of comments) {
      // Fire and forget comment deletions
      deleteComment(comment._id, comment.dreamId);
    }

    for (const star of stars) {
      // Fire and forget post unstars
      unstarPost({ id: star._id, postId: star.dreamId });
    }

    return { success: true };
  } catch (error) {
    logError(error, {
      service: "db",
      component: "deleteAccount",
    });
    return { success: false };
  }
}
