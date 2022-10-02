import { ObjectID } from "bson";
import {
  getDreamsCollection,
  getUsersCollection,
  getAccountsCollection,
  getCommentsCollection,
  getStarsCollection,
} from "../mongodb";
import { logError, logWarn } from "../o11y";
import { encryptDream } from "../transformations";
import { isDreamOwner } from "../validations";
import {
  getCommentsByUserId,
  getDreamById,
  getStarsByUserEmail,
  getUserByEmail,
} from "./reads";
import { getInsights } from "../insights";

/**
 * @private
 */
export async function createDream(data) {
  const { dream: dreamData, session } = data;

  const [user, collection] = await Promise.all([
    getUserByEmail(session.user.email),
    getDreamsCollection(),
  ]);

  const insights = getInsights(dreamData.dream.text);

  const encryptedDream = encryptDream(dreamData.dream);

  const result = await collection.insertOne({
    dream: encryptedDream,
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
 * @private
 */
export async function updateDream(dreamId, rawDreamData, userEmail) {
  const [collection, user, dreamData] = await Promise.all([
    getDreamsCollection(),
    getUserByEmail(userEmail),
    getDreamById(dreamId),
  ]);

  if (!isDreamOwner(dreamData, user)) {
    return null;
  }

  let possiblyUpdatedDream = rawDreamData.dream;
  const insights = getInsights(rawDreamData.dream.text);

  if (dreamData.visibility === "private") {
    possiblyUpdatedDream = encryptDream(rawDreamData.dream);
  }

  const result = await collection.updateOne(
    {
      _id: ObjectID(dreamId),
    },
    {
      $set: {
        dream: possiblyUpdatedDream,
        ...insights,
        lastUpdatedAt: new Date().toISOString(),
      },
    }
  );

  return result;
}

/**
 * @private
 */
export async function updateDreamVisibility(dreamId, visibility, userEmail) {
  const [collection, user, dreamData] = await Promise.all([
    getDreamsCollection(),
    getUserByEmail(userEmail),
    getDreamById(dreamId),
  ]);

  if (!isDreamOwner(dreamData, user)) {
    return null;
  }

  if (dreamData.visibility !== "private" && visibility !== "private") {
    const result = await collection.updateOne(
      {
        _id: ObjectID(dreamId),
      },
      {
        $set: { visibility, lastUpdatedAt: new Date().toISOString() },
      }
    );

    return result;
  }

  if (dreamData.visibility === "private" && visibility !== "private") {
    const result = await collection.updateOne(
      {
        _id: ObjectID(dreamId),
      },
      {
        $set: {
          // At this point the dream is already decrypted, see getDreamById
          dream: dreamData.dream,
          visibility,
          lastUpdatedAt: new Date().toISOString(),
        },
      }
    );

    return result;
  }

  const encryptedDream = encryptDream(dreamData.dream);

  const result = await collection.updateOne(
    {
      _id: ObjectID(dreamId),
    },
    {
      $set: {
        dream: encryptedDream,
        visibility,
        lastUpdatedAt: new Date().toISOString(),
      },
    }
  );

  return result;
}

/**
 * @private
 */
export async function deleteDream(dreamId) {
  const [collection, commentsCollection, starsCollection] = await Promise.all([
    getDreamsCollection(),
    getCommentsCollection(),
    getStarsCollection(),
  ]);

  try {
    await Promise.all([
      collection.deleteOne({
        _id: ObjectID(dreamId),
      }),
      commentsCollection.deleteMany({
        dreamId: ObjectID(dreamId),
      }),
      starsCollection.deleteMany({
        dreamId: ObjectID(dreamId),
      }),
    ]);

    return { success: true };
  } catch (error) {
    logError({ ...error, service: "db", component: "deleteDream" });
    return { success: false };
  }
}

/**
 * @private
 */
export async function deleteAccount(userEmail) {
  const [
    user,
    usersCollection,
    dreamsCollection,
    accountsCollection,
    commentsCollection,
    starsCollection,
  ] = await Promise.all([
    getUserByEmail(userEmail),
    getUsersCollection(),
    getDreamsCollection(),
    getAccountsCollection(),
    getCommentsCollection(),
    getStarsCollection(),
  ]);

  if (!user) {
    logWarn({
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
      dreamsCollection.deleteMany({ userId: ObjectID(user._id) }),
      accountsCollection.deleteOne({ userId: ObjectID(user._id) }),
      usersCollection.deleteOne({ email: userEmail }),
      // Delete all comments made on this user's dreams.
      commentsCollection.deleteMany({ dreamOwnerUserId: ObjectID(user._id) }),
      // Delete all stars given to this user's dreams.
      starsCollection.deleteMany({ dreamOwnerUserId: ObjectID(user._id) }),
    ]);

    // Delete comments made on other people's dreams and
    // decrement the dream count accordingly.
    for (const comment of comments) {
      // Skip awaiting, update as many dream comment counts
      // as possible as fast as possible.
      deleteComment(comment._id, comment.dreamId);
    }

    for (const star of stars) {
      unstarDream(star._id, star.dreamId);
    }

    return { success: true };
  } catch (error) {
    logError({ ...error, service: "db", component: "deleteAccount" });
    return { success: false };
  }
}

export async function updateUser(userId, data) {
  const collection = await getUsersCollection();

  const result = await collection.updateOne(
    {
      _id: ObjectID(userId),
    },
    {
      $set: {
        ...data,
      },
    }
  );

  return result;
}

/**
 * @private
 */
export async function createComment(data) {
  const { comment, dreamId, session } = data;

  const [user, collection] = await Promise.all([
    getUserByEmail(session.user.email),
    getCommentsCollection(),
  ]);

  const dream = await getDreamById(dreamId);

  const result = await collection.insertOne({
    userId: ObjectID(user._id),
    userName: user.name,
    userEmail: user.email,
    userImage: user.image,
    dreamId: ObjectID(dreamId),
    dreamOwnerUserId: ObjectID(dream.userId),
    createdAt: new Date().toISOString(),
    text: comment,
  });

  if (result.insertedId) {
    const dreamsCollection = await getDreamsCollection();

    await dreamsCollection.updateOne(
      {
        _id: ObjectID(dreamId),
      },
      { $inc: { commentCount: 1 } }
    );
  }

  return result;
}

/**
 * @private
 */
export async function deleteComment(commentId, dreamId) {
  const [collection, dreamsCollection] = await Promise.all([
    getCommentsCollection(),
    getDreamsCollection(),
  ]);

  return await Promise.all([
    collection.deleteOne({ _id: ObjectID(commentId) }),
    dreamsCollection.updateOne(
      {
        _id: ObjectID(dreamId),
      },
      { $inc: { commentCount: -1 } }
    ),
  ]);
}

/**
 * @private
 */
export async function starDream(data) {
  const { dreamId, session } = data;

  const [user, collection] = await Promise.all([
    getUserByEmail(session.user.email),
    getStarsCollection(),
  ]);

  const dream = await getDreamById(dreamId);

  const result = await collection.insertOne({
    userId: ObjectID(user._id),
    userName: user.name,
    userEmail: user.email,
    userImage: user.image,
    dreamId: ObjectID(dreamId),
    dreamOwnerUserId: ObjectID(dream.userId),
    createdAt: new Date().toISOString(),
  });

  if (result.insertedId) {
    const dreamsCollection = await getDreamsCollection();

    await dreamsCollection.updateOne(
      {
        _id: ObjectID(dreamId),
      },
      { $inc: { starCount: 1 } }
    );
  }

  return result;
}

/**
 * @private
 */
export async function unstarDream(data) {
  const { dreamId, session } = data;

  const [collection, dreamsCollection] = await Promise.all([
    getStarsCollection(),
    getDreamsCollection(),
  ]);

  return await Promise.all([
    collection.deleteOne({
      userEmail: session.user.email,
      dreamId: ObjectID(dreamId),
    }),
    dreamsCollection.updateOne(
      {
        _id: ObjectID(dreamId),
      },
      { $inc: { starCount: -1 } }
    ),
  ]);
}
