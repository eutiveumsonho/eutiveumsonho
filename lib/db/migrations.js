import { ObjectID } from "bson";
import { getInsights } from "../insights";
import { getDreamsCollection } from "../mongodb";
import { decryptDream } from "../transformations";
import { hasCommentedOnDream } from "./reads";
import { generateComment } from "./writes";

/**
 * @dataCorrection
 */
export async function addMissingWordFreqData() {
  const collection = await getDreamsCollection();

  const cursor = collection.find();

  const result = await cursor.toArray();

  if (result.lenght === 0) {
    return null;
  }

  const privateDeams = result.filter((data) => data.visibility === "private");
  const publicDreams = result.filter((data) => data.visibility !== "private");

  await Promise.all([
    ...privateDeams.map((data) => {
      const decrypted = decryptDream(data.dream);
      const insights = getInsights(decrypted.text);

      collection.updateOne(
        {
          _id: ObjectID(data._id),
        },
        {
          $set: insights,
        }
      );
    }),
    ...publicDreams.map((data) => {
      const insights = getInsights(data.dream.text);
      collection.updateOne(
        {
          _id: ObjectID(data._id),
        },
        {
          $set: insights,
        }
      );
    }),
  ]);

  await cursor.close();

  return result;
}

/**
 * @dataCorrection
 */
export async function addMissingAICommentData() {
  const collection = await getDreamsCollection();

  const cursor = collection.find();

  const result = await cursor.toArray();

  if (result.lenght === 0) {
    return null;
  }

  const privateDeams = result.filter((data) => data.visibility === "private");
  const publicDreams = result.filter((data) => data.visibility !== "private");

  await Promise.all([
    ...privateDeams.map(async (data) => {
      const hasCommented = await hasCommentedOnDream("Sonio", data.dream._id);

      if (!hasCommented) {
        const decrypted = decryptDream(data.dream);
        const dreamOwner = await getUserById(data.dream.userId);
        return generateComment(data.dream._id, decrypted, {
          user: {
            email: dreamOwner.email,
          },
        });
      }
    }),
    ...publicDreams.map(async (data) => {
      const hasCommented = await hasCommentedOnDream("Sonio", data.dream._id);

      if (!hasCommented) {
        const dreamOwner = await getUserById(data.dream.userId);
        return generateComment(data.dream._id, decrypted, {
          user: {
            email: dreamOwner.email,
          },
        });
      }
    }),
  ]);

  await cursor.close();

  return result;
}
