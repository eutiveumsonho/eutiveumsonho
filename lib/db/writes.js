import { ObjectID } from "bson";
import {
  getDreamsCollection,
  getUsersCollection,
  getAccountsCollection,
  getCommentsCollection,
} from "../mongodb";
import { logError, logWarn } from "../o11y";
import { encryptDream } from "../transformations";
import { isDreamOwner } from "../validations";
import { getCommentsByUserId, getDreamById, getUserByEmail } from "./reads";

/**
 * @private
 */
export async function createDream(data) {
  const { dream: dreamData, session } = data;

  const [user, collection] = await Promise.all([
    getUserByEmail(session.user.email),
    getDreamsCollection(),
  ]);

  const encryptedDream = encryptDream(dreamData.dream);

  const result = await collection.insertOne({
    dream: encryptedDream,
    userId: ObjectID(user._id),
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    visibility: "private",
    commentCount: 0,
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
  const collection = await getDreamsCollection();

  try {
    await collection.deleteOne({
      _id: ObjectID(dreamId),
    });

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
  ] = await Promise.all([
    getUserByEmail(userEmail),
    getUsersCollection(),
    getDreamsCollection(),
    getAccountsCollection(),
    getCommentsCollection(),
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

    await Promise.all([
      dreamsCollection.deleteMany({ userId: ObjectID(user._id) }),
      accountsCollection.deleteOne({ userId: ObjectID(user._id) }),
      usersCollection.deleteOne({ email: userEmail }),
      commentsCollection.deleteMany({ userId: ObjectID(user._id) }),
    ]);

    for (const comment of comments) {
      // skip awaiting, update as many dream comment counts
      // as possible as fast as possible
      try {
        dreamsCollection.updateOne(
          {
            _id: ObjectID(comment.dreamId),
          },
          { $inc: { commentCount: -1 } }
        );
      } catch (error) {
        continue;
      }
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

  const result = await collection.insertOne({
    userId: ObjectID(user._id),
    userName: user.name,
    userEmail: user.email,
    userImage: user.image,
    dreamId: ObjectID(dreamId),
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
export async function deleteComment(commentId) {
  const [collection, dreamsCollection] = await Promise.all([
    getCommentsCollection(),
    getDreamsCollection(),
  ]);

  await collection.deleteOne({ commentId: ObjectID(user._id) });
  await dreamsCollection.updateOne(
    {
      _id: ObjectID(dreamId),
    },
    { $inc: { commentCount: -1 } }
  );
}
