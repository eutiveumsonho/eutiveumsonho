import { ObjectID } from "bson";
import { getInsights } from "../insights";
import { getDreamsCollection } from "../mongodb";
import { decryptDream } from "../transformations";
import { hasCommentedOnDream } from "./reads";
import { generateCompletion } from "./writes";

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
      ["Sonio", "Sonia"].map(async (aiName) => {
        const hasCommented = await hasCommentedOnDream(aiName, data._id);

        if (!hasCommented) {
          const decrypted = decryptDream(data.dream);
          return generateCompletion(
            data.dream._id,
            decrypted.text,
            undefined,
            data.dream.userId
          );
        }
      });
    }),
    ...publicDreams.map(async (data) => {
      ["Sonio", "Sonia"].map(async (aiName) => {
        const hasCommented = await hasCommentedOnDream(aiName, data._id);

        if (!hasCommented) {
          return generateCompletion(
            data._id,
            data.dream.text,
            undefined,
            data.userId
          );
        }
      });
    }),
  ]);

  await cursor.close();

  return result;
}
