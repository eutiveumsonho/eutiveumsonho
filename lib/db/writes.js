import { ObjectID } from "bson";
import { getDreamsCollection } from "../mongodb";
import { decryptDream, encryptDream } from "../transformations";
import { isDreamOwner } from "../validations";
import { getDreamById } from "./reads";

/**
 * @private
 */
export async function createDream(data) {
  const { dream: dreamData, session } = data;

  const collection = await getDreamsCollection();

  const encryptedDream = encryptDream(dreamData.dream);

  const result = await collection.insertOne({
    dream: encryptedDream,
    userEmail: session.user.email,
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
  const collection = await getDreamsCollection();
  const dreamData = await getDreamById(dreamId);

  if (!isDreamOwner(dreamData, userEmail)) {
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
  const collection = await getDreamsCollection();
  const dreamData = await getDreamById(dreamId);

  if (!isDreamOwner(dreamData, userEmail)) {
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
