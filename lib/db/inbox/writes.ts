import { ObjectId } from "bson";
import { getInboxCollection } from "../mongodb";

/**
 * Marks some inbox messages as read.
 */
export async function markSomeInboxMessagesAsRead(inboxIds: string[]): Promise<any> {
  const collection = await getInboxCollection();

  const bulk = collection.initializeOrderedBulkOp();

  inboxIds.forEach((id) => {
    bulk.find({ _id: new ObjectId(id) }).update({
      $set: {
        read: true,
        lastUpdatedAt: new Date().toISOString(),
      },
    });
  });

  const result = await bulk.execute();

  return result;
}

/**
 * Marks all inbox messages as read.
 */
export async function markAllInboxMessagesAsRead(userEmail: string): Promise<any> {
  const collection = await getInboxCollection();

  const result = await collection.updateMany(
    {
      dreamOwnerUserEmail: userEmail,
    },
    {
      $set: {
        read: true,
        lastUpdatedAt: new Date().toISOString(),
      },
    }
  );

  return result;
}

/**
 * Deletes all inbox messages.
 */
export async function deleteAllInboxMessages(userEmail: string): Promise<any> {
  const collection = await getInboxCollection();

  const result = await collection.deleteMany({
    dreamOwnerUserEmail: userEmail,
  });

  return result;
}

/**
 * Deletes the inbox messages with the provided IDs.
 */
export async function deleteSomeInboxMessages(inboxIds: string[]): Promise<any> {
  const collection = await getInboxCollection();

  const bulk = collection.initializeOrderedBulkOp();

  inboxIds.forEach((id) => {
    bulk.find({ _id: new ObjectId(id) }).delete();
  });

  const result = await bulk.execute();

  return result;
}