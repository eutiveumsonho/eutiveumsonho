// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getServerSession, validateSessions } from "../../../lib/auth";
import { createDream } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end(METHOD_NOT_ALLOWED);
    return res;
  }

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
