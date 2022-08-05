import { getDreamsCollection } from "../mongodb";

export async function createDream(data) {
  const { dream, session } = data;

  const collection = await getDreamsCollection();

  const result = await collection.insertOne({
    ...dream,
    userEmail: session.user.email,
  });

  return result;
}

export async function updateDream() {}
