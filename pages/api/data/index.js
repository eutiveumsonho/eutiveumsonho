// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getServerSession } from "../../../lib/auth";
import { createDream, updateDream } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
      return post(req, res);
    case "PATCH":
      return patch(req, res);
    default:
      res.setHeader("Allow", ["POST", "PATCH"]);
      res.status(405).end(METHOD_NOT_ALLOWED);
      return res;
  }
}

async function patch(req, res) {
  const session = await getServerSession(req, res);

  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  if (
    !req.body?.dreamData?.dream?.text ||
    !req.body?.dreamData?.dream?.html ||
    !req.body?.dreamId
  ) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    await updateDream(
      req.body.dreamId,
      req.body.dreamData.dream,
      session.user.email
    );

    res.setHeader("Content-Type", "application/json");
    res.status(200).end();

    return res;
  } catch (error) {
    console.error(error);
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

/**
 * This is called when a dream is saved
 * for the very first time.
 */
async function post(req, res) {
  const session = await getServerSession(req, res);

  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  if (!req.body?.dream?.text || !req.body?.dream?.html) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  const data = { dream: req.body, session };

  try {
    const result = await createDream(data);

    const objectId = result.insertedId.toString();

    res.setHeader("Content-Type", "application/json");
    res.status(201).send({ objectId });

    return res;
  } catch (error) {
    console.error(error);
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}
