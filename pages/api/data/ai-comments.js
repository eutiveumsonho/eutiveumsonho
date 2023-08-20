// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getServerSession } from "../../../lib/auth";
import { hasCommentedOnDream } from "../../../lib/db/reads";
import { createComment, saveCompletion } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";
import { withTracing } from "../../../lib/middleware";
import { logError } from "../../../lib/o11y";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_TOKEN,
});

function handler(req, res) {
  switch (req.method) {
    case "POST":
      return post(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(METHOD_NOT_ALLOWED);
      return res;
  }
}

/**
 * @private
 */
async function post(req, res) {
  const session = await getServerSession(req, res);

  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  if (!req.body.dreamId || !req.body.text) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  const hasCommented = await hasCommentedOnDream("Sonio", req.body.dreamId);

  if (hasCommented) {
    res.setHeader("Content-Type", "application/json");
    res.status(200).send("OK");
    return res;
  }

  const params = {
    messages: [{ role: "user", content: generatePrompt(req.body.text) }],
    model: "gpt-3.5-turbo",
  };

  const completion = await openai.chat.completions.create(params);

  // Dispatch to save completion
  saveCompletion(completion, session.user.email);

  const comment = completion.choices[0].message.content;

  const data = {
    comment,
    dreamId: req.body.dreamId,
    session: {
      user: {
        name: "Sonio",
        email: "marcelo@eutiveumsonho.com",
        image: "https://eutiveumsonho.com/android-chrome-192x192.png",
      },
      expires: new Date(8640000000000000), // Maximum timestamp,
    },
  };

  try {
    const result = await createComment(data);

    const objectId = result.insertedId?.toString();

    res.setHeader("Content-Type", "application/json");
    res.status(201).send({ objectId });

    return res;
  } catch (error) {
    logError({
      error,
      service: "api",
      pathname: "/api/data/ai-comments",
      method: "post",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

function generatePrompt(dream) {
  return `Act as a psychotherapist specializing in dream interpretation with a deep knowledge of archetypes and mythology. 
  When presented with a dream narrative, provide insightful analysis and open-ended questions to help the dreamer gain a deeper understanding of their dream.
  Do not provide personal opinions or assumptions about the dreamer. 
  Provide only factual interpretations based on the information given. 
  Keep your answer short and concise, with 5000 characters at most.
  Always respond in the language in which the dream narrative is presented, even if it differs from the initial instruction language (English).
  Dream: ${dream}`;
}

export default withTracing(handler);
