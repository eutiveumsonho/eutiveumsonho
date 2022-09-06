import { ObjectID } from "bson";
import { decrypt, encrypt } from "../encryption";
import { getDreamsCollection } from "../mongodb";
import { isDreamOwner } from "../validations";
import { getDreamById } from "./reads";

/**
 * @private
 */
export async function createDream(data) {
  const { dream, session } = data;

  const collection = await getDreamsCollection();

  const encryptedDreamText = encrypt(dream.text);
  const encryptedDreamHtml = encrypt(dream.html);

  const result = await collection.insertOne({
    text: encryptedDreamText,
    html: encryptedDreamHtml,
    userEmail: session.user.email,
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    visibility: "private",
  });

  return result;
}

/**
 * @private
 */
export async function updateDream(dreamId, rawDreamData, userEmail) {
  const collection = await getDreamsCollection();
  const dream = await getDreamById(dreamId);

  if (!isDreamOwner(dream, userEmail)) {
    return null;
  }

  let dreamData = rawDreamData;

  if (dream.visibility === "private") {
    dreamData = {
      text: encrypt(rawDreamData.text),
      html: encrypt(rawDreamData.html),
    };
  }

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

/**
 * @private
 */
export async function updateDreamVisibility(dreamId, visibility, userEmail) {
  const collection = await getDreamsCollection();
  const dream = await getDreamById(dreamId);

  if (!isDreamOwner(dream, userEmail)) {
    return null;
  }

  if (dream.visibility !== "private" && visibility !== "private") {
    const result = await collection.updateOne(
      {
        _id: ObjectID(dreamId),
      },
      {
        $set: { visibility, lastUpdatedAt: new Date().toISOString() },
      }
    );

    return result;
  }

  if (dream.visibility === "private" && visibility !== "private") {
    const dreamData = {
      text: decrypt(dream.text),
      html: decrypt(dream.html),
    };

    const result = await collection.updateOne(
      {
        _id: ObjectID(dreamId),
      },
      {
        $set: {
          ...dreamData,
          visibility,
          lastUpdatedAt: new Date().toISOString(),
        },
      }
    );

    return result;
  }

  const dreamData = {
    text: encrypt(dream.text),
    html: encrypt(dream.html),
  };

  const result = await collection.updateOne(
    {
      _id: ObjectID(dreamId),
    },
    {
      $set: {
        ...dreamData,
        visibility,
        lastUpdatedAt: new Date().toISOString(),
      },
    }
  );

  return result;
}
