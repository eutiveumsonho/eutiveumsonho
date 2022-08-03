// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getServerSession, validateSessions } from "../../../lib/auth";
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

  const clientSession = req.body.session;
  const session = await getServerSession(req, res);
  const isValidSession = validateSessions(clientSession, session);

  if (!isValidSession) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  if (!req.body.text || !req.body.html) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    await Promise.all([]);

    res.setHeader("Content-Type", "application/json");
    res.status(201).end();

    return res;
  } catch (error) {
    console.error(error);
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}
