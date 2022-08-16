import { ObjectID } from "bson";
import { getDreamsCollection } from "../mongodb";

export async function createDream(data) {
  const { dream, session } = data;

  const collection = await getDreamsCollection();

  const result = await collection.insertOne({
    ...dream,
    userEmail: session.user.email,
    createdAt: new Date().toISOString(),
  });

  return result;
}

export async function updateDream(dreamId, dreamData) {
  const collection = await getDreamsCollection();

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
