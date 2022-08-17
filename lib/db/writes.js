import { ObjectID } from "bson";
import { getDreamsCollection } from "../mongodb";
import { isDreamOwner } from "../validations";

export async function createDream(data) {
  const { dream, session } = data;

  const collection = await getDreamsCollection();

  const result = await collection.insertOne({
    ...dream,
    userEmail: session.user.email,
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    visibility: "private",
  });

  return result;
}

export async function updateDream(dreamId, dreamData, userEmail) {
  const collection = await getDreamsCollection();

  if (!isDreamOwner(dreamId, userEmail)) {
    return null;
  }

  const result = await collection.updateOne(
    {
      _id: ObjectID(dreamId),
    },
    {
      $set: { dream: dreamData, lastUpdatedAt: new Date().toISOString() },
    }
  );

  return result;
}

export async function updateDreamVisibility(dreamId, visibility, userEmail) {
  const collection = await getDreamsCollection();

  if (!isDreamOwner(dreamId, userEmail)) {
    return null;
  }

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
