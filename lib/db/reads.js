import { ObjectID } from "bson";
import { getDreamsCollection } from "../mongodb";

export async function getDreamById(dreamId) {
  const collection = await getDreamsCollection();

  const cursor = collection.find({ _id: ObjectID(dreamId) }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }

  return result[0];
}
