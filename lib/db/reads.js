import { getDreamsCollection } from "../mongodb";

export async function getDreamById(data) {
  const { dreamId } = data;

  const collection = await getDreamsCollection();

  const result = await collection.findOne(dreamId);

  return result;
}
