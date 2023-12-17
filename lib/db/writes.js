import { ObjectID } from "bson";
import {
  getDreamsCollection,
  getUsersCollection,
  getAccountsCollection,
  getCommentsCollection,
  getStarsCollection,
  getInboxCollection,
  getCompletionsCollection,
} from "../mongodb";
import { encryptDream } from "../transformations";
import { isDreamOwner } from "../validations";
import {
  getCommentById,
  getCommentsByUserId,
  getDreamById,
  getStar,
  getStarsByUserEmail,
  getUserByEmail,
  getUserById,
} from "./reads";
import { getInsights } from "../insights";
import { v4 as uuid } from "uuid";
import OpenAI from "openai";
import { hitChiron } from "../chiron";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_TOKEN,
});

/**
 * @todo document this
 */
export async function createDream(data) {
  const { dream: dreamData, session } = data;

  const [user, collection] = await Promise.all([
    getUserByEmail(session.user.email),
    getDreamsCollection(),
  ]);

  const insights = getInsights(dreamData.dream.text);

  const encryptedDream = encryptDream(dreamData.dream);

  const result = await collection.insertOne({
    dream: encryptedDream,
    userId: ObjectID(user._id),
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    visibility: "private",
    commentCount: 0,
    starCount: 0,
    ...insights,
  });

  return result;
}

/**
 * @todo document this
 */
export async function updateDream(dreamId, rawDreamData, userEmail) {
  const [collection, user, dreamData] = await Promise.all([
    getDreamsCollection(),
    getUserByEmail(userEmail),
    getDreamById(dreamId),
  ]);

  if (!isDreamOwner(dreamData, user)) {
    return null;
  }

  let possiblyUpdatedDream = rawDreamData.dream;
  const insights = getInsights(rawDreamData.dream.text);

  if (dreamData.visibility === "private") {
    possiblyUpdatedDream = encryptDream(rawDreamData.dream);
  }

  const result = await collection.updateOne(
    {
      _id: ObjectID(dreamId),
    },
    {
      $set: {
        dream: possiblyUpdatedDream,
        ...insights,
        lastUpdatedAt: new Date().toISOString(),
      },
    }
  );

  return result;
}

/**
 * Method responsible for updating a dream's visibility.
 *
 * @param {string} dreamId - The dream's ID
 * @param {string} visibility - "public" or "private"
 * @param {string} userEmail - The dream owner user's email
 * @returns {Promise<{ success: boolean }>}
 */
export async function updateDreamVisibility(dreamId, visibility, userEmail) {
  const [collection, user, dreamData] = await Promise.all([
    getDreamsCollection(),
    getUserByEmail(userEmail),
    getDreamById(dreamId),
  ]);

  if (!isDreamOwner(dreamData, user)) {
    return null;
  }

  if (dreamData.visibility !== "private" && visibility !== "private") {
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

  if (dreamData.visibility === "private" && visibility !== "private") {
    const result = await collection.updateOne(
      {
        _id: ObjectID(dreamId),
      },
      {
        $set: {
          // At this point the dream is already decrypted, see getDreamById
          dream: dreamData.dream,
          visibility,
          lastUpdatedAt: new Date().toISOString(),
        },
      }
    );

    return result;
  }

  const encryptedDream = encryptDream(dreamData.dream);

  const result = await collection.updateOne(
    {
      _id: ObjectID(dreamId),
    },
    {
      $set: {
        dream: encryptedDream,
        visibility,
        lastUpdatedAt: new Date().toISOString(),
      },
    }
  );

  return result;
}

/**
 * Method responsible for deleting a dream.
 *
 * @function
 * @param {string} dreamId - The dream's ID
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteDream(dreamId) {
  const [collection, commentsCollection, starsCollection] = await Promise.all([
    getDreamsCollection(),
    getCommentsCollection(),
    getStarsCollection(),
  ]);

  try {
    await Promise.all([
      collection.deleteOne({
        _id: ObjectID(dreamId),
      }),
      commentsCollection.deleteMany({
        dreamId: ObjectID(dreamId),
      }),
      starsCollection.deleteMany({
        dreamId: ObjectID(dreamId),
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error({ error, service: "db", component: "deleteDream" });
    return { success: false };
  }
}

/**
 * Method responsible for deleting a user's account.
 * This method is called when a user deletes their account.
 * It deletes all dreams, comments and stars related to the user, and the user's account.
 *
 * @param {string} userEmail - The user's email
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteAccount(userEmail) {
  const [
    user,
    usersCollection,
    dreamsCollection,
    accountsCollection,
    commentsCollection,
    starsCollection,
  ] = await Promise.all([
    getUserByEmail(userEmail),
    getUsersCollection(),
    getDreamsCollection(),
    getAccountsCollection(),
    getCommentsCollection(),
    getStarsCollection(),
  ]);

  if (!user) {
    console.warn({
      message: "No user found",
      service: "db",
      pathname: "deleteAccount",
    });
    return { success: false };
  }

  try {
    const comments = await getCommentsByUserId(user._id);
    const stars = await getStarsByUserEmail(user.email);

    await Promise.all([
      dreamsCollection.deleteMany({ userId: ObjectID(user._id) }),
      accountsCollection.deleteOne({ userId: ObjectID(user._id) }),
      usersCollection.deleteOne({ email: userEmail }),
      // Delete all comments made on this user's dreams.
      commentsCollection.deleteMany({ dreamOwnerUserId: ObjectID(user._id) }),
      // Delete all stars given to this user's dreams.
      starsCollection.deleteMany({ dreamOwnerUserId: ObjectID(user._id) }),
    ]);

    // Delete comments made on other people's dreams and
    // decrement the dream count accordingly.
    for (const comment of comments) {
      // Skip awaiting, update as many dream comment counts
      // as possible as fast as possible.
      deleteComment(comment._id, comment.dreamId);
    }

    for (const star of stars) {
      unstarDream(star._id, star.dreamId);
    }

    return { success: true };
  } catch (error) {
    console.error({ error, service: "db", component: "deleteAccount" });
    return { success: false };
  }
}

export async function updateUser(userId, data) {
  const collection = await getUsersCollection();

  const result = await collection.updateOne(
    {
      _id: ObjectID(userId),
    },
    {
      $set: {
        ...data,
      },
    }
  );

  return result;
}

/**
 * This method is responsible for creating a comment.
 * It also creates an inbox message for the dream owner.
 * If the dream owner is the same as the user, no inbox message is created.
 * It has a special case for the AI user, which is a bot that creates comments.
 * The AI user doesn't have a database object, so it skips getting the user's database object.
 *
 * @param {object} data - The data object
 * @param {string} data.comment - The comment text
 * @param {string} data.dreamId - The dream ID
 * @param {object} data.session - The session object
 * @param {object} data.session.user - The user object
 * @param {string} data.session.user.name - The user's name
 * @param {string} data.session.user.email - The user's email
 * @param {string} data.session.user.image - The user's image
 * @returns {Promise<{ insertedId: string }>}
 */
export async function createComment(data) {
  const { comment, dreamId, session } = data;

  // Skip getting user's database object because it doesn't really exist.
  const isAIComment = session.user.name === "Sonia";

  if (isAIComment) {
    const [collection, inboxCollection] = await Promise.all([
      getCommentsCollection(),
      getInboxCollection(),
    ]);

    const dream = await getDreamById(dreamId);
    const dreamOwner = await getUserById(dream.userId);

    const inboxKey = uuid();

    const [result, _] = await Promise.all([
      collection.insertOne({
        // Grab the user's name from the mocked session.
        userId: session.user.name,
        userName: session.user.name,
        userEmail: session.user.email,
        userImage: session.user.image,
        dreamId: ObjectID(dreamId),
        dreamOwnerUserId: ObjectID(dream.userId),
        createdAt: new Date().toISOString(),
        text: comment,
        inboxKey,
      }),
      inboxCollection.insertOne({
        userId: session.user.name,
        userName: session.user.name,
        userEmail: session.user.email,
        userImage: session.user.image,
        dreamId: ObjectID(dreamId),
        dreamOwnerUserEmail: dreamOwner.email,
        createdAt: new Date().toISOString(),
        type: "comment",
        read: false,
        commentKey: inboxKey,
      }),
    ]);

    if (result.insertedId) {
      const dreamsCollection = await getDreamsCollection();

      await dreamsCollection.updateOne(
        {
          _id: ObjectID(dreamId),
        },
        { $inc: { commentCount: 1 } }
      );
    }

    return result;
  }

  if (!isAIComment) {
    const [user, collection, inboxCollection] = await Promise.all([
      getUserByEmail(session.user.email),
      getCommentsCollection(),
      getInboxCollection(),
    ]);

    const dream = await getDreamById(dreamId);
    const dreamOwner = await getUserById(dream.userId);

    let shouldCreateNewInbox = true;
    if (dreamOwner.email === user.email) {
      shouldCreateNewInbox = false;
    }

    const inboxKey = uuid();

    const [result, _] = await Promise.all([
      collection.insertOne({
        userId: ObjectID(user._id),
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
        dreamId: ObjectID(dreamId),
        dreamOwnerUserId: ObjectID(dream.userId),
        createdAt: new Date().toISOString(),
        text: comment,
        inboxKey: shouldCreateNewInbox ? inboxKey : null,
      }),
      shouldCreateNewInbox
        ? inboxCollection.insertOne({
            userId: ObjectID(user._id),
            userName: user.name,
            userEmail: user.email,
            userImage: user.image,
            dreamId: ObjectID(dreamId),
            dreamOwnerUserEmail: dreamOwner.email,
            createdAt: new Date().toISOString(),
            type: "comment",
            read: false,
            commentKey: inboxKey,
          })
        : () => null,
    ]);

    if (result.insertedId) {
      const dreamsCollection = await getDreamsCollection();

      await dreamsCollection.updateOne(
        {
          _id: ObjectID(dreamId),
        },
        { $inc: { commentCount: 1 } }
      );
    }

    return result;
  }
}

/**
 * This method is responsible for deleting a comment from a dream.
 * It also deletes the inbox message for the dream owner.
 *
 * @param {string} commentId - The comment ID
 * @param {string} dreamId - The dream ID
 * @returns {Promise<any>}
 */
export async function deleteComment(commentId, dreamId) {
  const [collection, dreamsCollection, inboxCollection] = await Promise.all([
    getCommentsCollection(),
    getDreamsCollection(),
    getInboxCollection(),
  ]);

  const comment = await getCommentById(commentId);

  return await Promise.all([
    collection.deleteOne({ _id: ObjectID(commentId) }),
    dreamsCollection.updateOne(
      {
        _id: ObjectID(dreamId),
      },
      { $inc: { commentCount: -1 } }
    ),
    inboxCollection.deleteOne({
      userEmail: session.user.email,
      commentKey: comment?.inboxKey,
    }),
  ]);
}

/**
 * This method is responsible for starring a dream.
 * It also creates an inbox message for the dream owner.
 * If the dream owner is the same as the user, no inbox message is created.
 *
 * @param {object} data - The data object
 * @param {string} data.dreamId - The dream ID
 * @param {object} data.session - The session object
 * @param {object} data.session.user - The user object
 * @param {string} data.session.user.name - The user's name
 * @param {string} data.session.user.email - The user's email
 * @param {string} data.session.user.image - The user's image
 * @returns {Promise<{ insertedId: string }>}
 */
export async function starDream(data) {
  const { dreamId, session } = data;

  const [user, collection, inboxCollection] = await Promise.all([
    getUserByEmail(session.user.email),
    getStarsCollection(),
    getInboxCollection(),
  ]);

  const dream = await getDreamById(dreamId);
  const dreamOwner = await getUserById(dream.userId);

  let shouldCreateNewInbox = true;
  if (dreamOwner.email === user.email) {
    shouldCreateNewInbox = false;
  }

  const inboxKey = uuid();

  const [result, _] = await Promise.all([
    collection.insertOne({
      userId: ObjectID(user._id),
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
      dreamId: ObjectID(dreamId),
      dreamOwnerUserId: ObjectID(dream.userId),
      createdAt: new Date().toISOString(),
      inboxKey: shouldCreateNewInbox ? inboxKey : null,
    }),
    // The only difference between the inbox
    // and the stars collection, is that
    // the inbox collection is ephemeral
    shouldCreateNewInbox
      ? inboxCollection.insertOne({
          userId: ObjectID(user._id),
          userName: user.name,
          userEmail: user.email,
          userImage: user.image,
          dreamId: ObjectID(dreamId),
          dreamOwnerUserEmail: dreamOwner.email,
          createdAt: new Date().toISOString(),
          type: "star",
          read: false,
          starKey: inboxKey,
        })
      : () => null,
  ]);

  if (result.insertedId) {
    const dreamsCollection = await getDreamsCollection();

    await dreamsCollection.updateOne(
      {
        _id: ObjectID(dreamId),
      },
      { $inc: { starCount: 1 } }
    );
  }

  return result;
}

/**
 * @todo document this
 */
export async function unstarDream(data) {
  const { dreamId, session } = data;

  const [collection, dreamsCollection, inboxCollection] = await Promise.all([
    getStarsCollection(),
    getDreamsCollection(),
    getInboxCollection(),
  ]);

  const star = await getStar(session.user.email, dreamId);

  return await Promise.all([
    collection.deleteOne({
      userEmail: session.user.email,
      dreamId: ObjectID(dreamId),
    }),
    dreamsCollection.updateOne(
      {
        _id: ObjectID(dreamId),
      },
      { $inc: { starCount: -1 } }
    ),
    inboxCollection.deleteOne({
      userEmail: session.user.email,
      starKey: star?.inboxKey,
    }),
  ]);
}

/**
 * @todo document this
 */
export async function markSomeInboxMessagesAsRead(inboxIds) {
  const collection = await getInboxCollection();

  const bulk = collection.initializeOrderedBulkOp();

  inboxIds.forEach((id) => {
    bulk.find({ _id: ObjectID(id) }).update({
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
 * @todo document this
 */
export async function markAllInboxMessagesAsRead(userEmail) {
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
 * @todo document this
 */
export async function deleteAllInboxMessages(userEmail) {
  const collection = await getInboxCollection();

  const result = await collection.deleteMany({
    dreamOwnerUserEmail: userEmail,
  });

  return result;
}

/**
 * @todo document this
 */
export async function deleteSomeInboxMessages(inboxIds) {
  const collection = await getInboxCollection();

  const bulk = collection.initializeOrderedBulkOp();

  inboxIds.forEach((id) => {
    bulk.find({ _id: ObjectID(id) }).delete();
  });

  const result = await bulk.execute();

  return result;
}

export async function saveCompletion(completion, dreamId, userEmail, userId) {
  const collection = await getCompletionsCollection();

  // This should never happen as the client route (triggered first time a completion
  // is generated) always provides the userEmail from the session.
  // In the meanwhile, the system route (triggered from Chiron), always provides the userId.
  if (!userEmail && !userId) {
    throw new Error("No user data provided");
  }

  let user = {};

  // Client route; first completion
  if (userEmail && !userId) {
    user = await getUserByEmail(userEmail);
  }

  const data = {
    userId: ObjectID(userId ? userId : userEmail && user ? user._id : userId),
    dreamId: ObjectID(dreamId),
    completion,
    pendingReview: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.insertOne(data);

  return { result, data };
}

export async function generateCompletion(dreamId, text, session, userId) {
  const params = {
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: text },
    ],
    model: "gpt-3.5-turbo",
  };

  const completion = await openai.chat.completions.create(params);

  const { result, data } = await saveCompletion(
    completion,
    dreamId,
    session?.user?.email,
    userId
  );

  if (result?.acknowledged || result?.insertedId) {
    await hitChiron(data);
  }
}

const systemInstruction = `Act as a psychotherapist specializing in dream interpretation with a deep knowledge of archetypes and mythology. 
  When presented with a dream narrative, provide insightful analysis and open-ended questions to help the dreamer gain a deeper understanding of their dream.
  Do not provide personal opinions or assumptions about the dreamer. 
  Provide only factual interpretations based on the information given. 
  Keep your answer short and concise, with 5000 characters at most.
  If the dream looks incomplete, never complete it.
  Always respond in the language in which the dream narrative is presented, even if it differs from the initial instruction language (English).`;
