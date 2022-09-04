import { ObjectID } from "bson";
import { getDreamsCollection, getUsersCollection } from "../mongodb";

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

export async function getDreams(userEmail) {
  const collection = await getDreamsCollection();

  const cursor = collection.find({ userEmail }).sort({ _id: -1 }).limit(10);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }

  return result;
}

export async function getLatestPublicDreams() {
  const collection = await getDreamsCollection();

  const cursor = collection
    .find({ visibility: { $in: ["public", "anonimous"] } })
    .sort({ _id: -1 })
    .limit(10);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }

  return result;
}

export async function getUserByEmail(userEmail) {
  const collection = await getUsersCollection();

  const cursor = collection.find({ email: userEmail }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }

  return result[0];
}
