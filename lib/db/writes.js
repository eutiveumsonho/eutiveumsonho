/** @module lib/db/writes */
import { ObjectID } from "bson";
import {
  getCompletionsCollection,
  getCosineSimilarityCollection,
} from "../mongodb";
import { getUserByEmail } from "./reads";
import OpenAI from "openai";
import { hitChiron } from "../chiron";
import { createComment } from "./comments/writes";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_TOKEN,
});

// TODO: Replace all dream-specific scheme by post-specific scheme
export * from "./posts/writes";
export * from "./users/writes";
export * from "./comments/writes";
export * from "./inbox/writes";
export * from "./stars/writes";
export * from "./account/writes";

// All methods below this line shouldn't be ported to any package.

/**
 * Generates a comment from a completion, created by an AI.
 * It uses the createComment method to create the comment.
 *
 * @todo move AI logic from createComment to this method
 * @param {string} comment
 * @param {string} postId
 */
export async function createAIComment(comment, postId) {
  const data = {
    comment,
    dreamId: postId,
    session: {
      user: {
        name: "Sonia",
        email: "no-reply@eutiveumsonho.com",
        image: "https://eutiveumsonho.com/android-chrome-192x192.png",
      },
      expires: new Date(8640000000000000), // Maximum timestamp,
    },
  };

  await createComment(data);
}

/**
 * Saves a completion to the database
 *
 * @param {*} completion
 * @param {*} postId
 * @param {*} userEmail
 * @param {*} userId
 */
export async function saveCompletion(completion, postId, userEmail, userId) {
  const collection = await getCompletionsCollection();

  // This should never happen as the client route (triggered first time a completion
  // is generated) always provides the userEmail from the session.
  // In the meanwhile, backend routes (triggered from Chiron or from upateDream), always provides the userId.

  // Backend routes
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
    dreamId: ObjectID(postId),
    completion,
    pendingReview: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.insertOne(data);

  return { result, data };
}

/**
 * Starts the completion generation process, which is followed by a
 * human-in-the-loop review process until it gets back to this
 * service
 *
 * session and userId params are optional because this method
 * has two possible workflows, one using the session and the other
 * using the userIds. The session workflow starts on the frontend,
 * while the userId workflow starts on the backend.
 *
 * This is this way because saveCompletions method is, and this method
 * calls it.
 *
 * @param {string} postId The dream id
 * @param {string} text The dream data text
 * @param {object} session (Optional) The session object. If not provided, the `userId` must be provided.
 * @param {string} userId (Optional) The user id. If not provided, the `session` must be provided.
 */
export async function generateCompletion(postId, text, session, userId) {
  const params = {
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: text },
    ],
    /**
     * @link https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo
     */
    model: "gpt-3.5-turbo-0613",
    /**
     * What sampling temperature to use, between 0 and 2.
     * Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
     * We generally recommend altering this or top_p but not both.
     *
     * @link https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature
     * @default 1
     */
    temperature: 0.2,
    /**
     * A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.
     * @link https://platform.openai.com/docs/guides/safety-best-practices/end-user-ids
     */
    user: userId,
  };

  const completion = await openai.chat.completions.create(params);

  const { result, data } = await saveCompletion(
    completion,
    postId,
    session?.user?.email,
    userId
  );

  if (result?.acknowledged || result?.insertedId) {
    await hitChiron(data);
  }
}

/**
 * Some prompt instructions for the AI to generate completions.
 */
const systemInstruction = `Act as a psychotherapist specializing in dream interpretation with a deep knowledge of archetypes and mythology. 
  When presented with a dream narrative, provide insightful analysis and open-ended questions to help the dreamer gain a deeper understanding of their dream.
  Do not provide personal opinions or assumptions about the dreamer. 
  Provide only factual interpretations based on the information given. 
  Keep your answer short and concise, with 5000 characters at most.
  If the dream looks incomplete, never complete it.
  Always respond in the language in which the dream narrative is presented, even if it differs from the initial instruction language (English).`;

/**
 * Saves the cosine similarity score between two texts.
 */
export async function saveCosineSimilarityScore(scoreData) {
  const csCollection = await getCosineSimilarityCollection();

  try {
    await csCollection.insertOne({
      scoreData,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error({
      error,
      service: "db",
      component: "saveCosineSimilarityScore",
    });
  }
}
