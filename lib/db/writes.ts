/** @module lib/db/writes */
import { ObjectId } from "bson";
import {
  getCompletionsCollection,
  getCosineSimilarityCollection,
} from "./mongodb";
import { getUserByEmail } from "./reads";
import { hitChiron } from "../chiron";
import { createComment } from "./comments/writes";
import { logError } from "../o11y/log";

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
 */
export async function createAIComment(comment: string, postId: string): Promise<void> {
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
 */
export async function saveCompletion(
  completion: any,
  postId: string,
  userEmail?: string,
  userId?: string
): Promise<{ result: any; data: any }> {
  const collection = await getCompletionsCollection();

  if (!userEmail && !userId) {
    throw new Error("No user data provided");
  }

  let user: any = {};

  if (userEmail && !userId) {
    user = await getUserByEmail(userEmail);
  }

  const data = {
    userId: new ObjectId(userId ? userId : userEmail && user ? user._id : userId),
    dreamId: new ObjectId(postId),
    completion,
    pendingReview: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await collection.insertOne(data);

  return { result, data };
}

/**
 * Starts the completion generation process
 */
export async function generateCompletion(
  postId: string,
  text: string,
  session?: { user: { email: string } },
  userId?: string
): Promise<void> {
  const params = {
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: text },
    ],
    model: "llama3.2:latest",
  };

  try {
    const response = await fetch(
      `${process.env.OLLAMA_API_URL}/api/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );

    const completion = await response.json();

    const { result, data } = await saveCompletion(
      completion,
      postId,
      session?.user?.email,
      userId
    );

    if (result?.acknowledged || result?.insertedId) {
      const enableHumanInTheLoop = false;
      if (enableHumanInTheLoop) {
        await hitChiron(data);
      } else {
        await createAIComment(completion.choices[0].message.content, postId);
      }
    }
  } catch (error) {
    logError(error, {
      service: "db",
      component: "generateCompletion",
    });
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
export async function saveCosineSimilarityScore(scoreData: any): Promise<void> {
  const csCollection = await getCosineSimilarityCollection();

  try {
    await csCollection.insertOne({
      scoreData,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    logError(error, {
      service: "db",
      component: "saveCosineSimilarityScore",
    });
  }
}
