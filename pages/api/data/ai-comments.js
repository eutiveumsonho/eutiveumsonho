// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getServerSession } from "../../../lib/auth";
import { createComment, deleteComment } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";
import { withTracing } from "../../../lib/middleware";
import { logError } from "../../../lib/o11y";

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

  const prompt = {
    inputs: {
      context:
        "Act as a psychotherapist that has a deep understanding of archetypes and mythologies and how dreams works and that has analyzed thousands of dreams. Comment on the dream below, responding on the language that it is written. Make open ended questions to help the person who dreamed this elaborate and interpretate on their own as well:\n\n" +
        req.body.text,
    },
  };

  const response = await fetch(
    "https://api-inference.huggingface.co/models/gpt2",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
      },
      method: "POST",
      body: JSON.stringify(prompt),
    }
  );

  const result = await response.json();

  console.log({ result });

  const data = {
    comment: "This comment will be generated by AI.",
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

export default withTracing(handler);
