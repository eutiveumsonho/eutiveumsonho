import { ObjectID } from "bson";
import { getDreamsCollection } from "../mongodb";
import { decryptDream, encryptDream } from "../transformations";
import { isDreamOwner } from "../validations";
import { getDreamById, getUserByEmail } from "./reads";

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
