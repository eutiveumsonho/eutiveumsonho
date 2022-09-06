import { ObjectID } from "bson";
import { decrypt } from "../encryption";
import { getDreamsCollection, getUsersCollection } from "../mongodb";

/**
 * @private
 */
export async function getDreamById(dreamId) {
  const collection = await getDreamsCollection();

  const cursor = collection.find({ _id: ObjectID(dreamId) }).limit(1);

  const result = await cursor.toArray();

  await cursor.close();

  if (result.lenght === 0) {
    return null;
  }

  const dream = result[0];

  if (dream.visibility === "private") {
    dream.text = decrypt(dream.text);
    dream.html = decrypt(dream.html);
  }

  return dream;
}

/**
 * @private
 */
export async function getDreams(userEmail) {
  const collection = await getDreamsCollection();

  const cursor = collection.find({ userEmail }).sort({ _id: -1 }).limit(10);

  const rawResult = await cursor.toArray();

  await cursor.close();

  if (rawResult.lenght === 0) {
    return null;
  }

  const result = [];

  for (const dream of rawResult) {
    if (dream.visibility === "private") {
      dream.text = decrypt(dream.text);
      dream.html = decrypt(dream.html);
    }

    result.push(dream);
  }

  return result;
}

/**
 * @public
 */
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

/**
 * @public
 */
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
