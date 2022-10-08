import { ObjectID } from "bson";
import { getInsights } from "../insights";
import { getDreamsCollection } from "../mongodb";
import { decryptDream } from "../transformations";

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
