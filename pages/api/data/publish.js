// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getServerSession } from "../../../lib/auth";
import { updateDreamVisibility } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";
import { logError } from "../../../lib/o11y";

export default async function handler(req, res) {
  switch (req.method) {
    case "PATCH":
      return patch(req, res);
    default:
      res.setHeader("Allow", ["PATCH"]);
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

  if (!req.body?.dreamId || !req.body?.visibility) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    await updateDreamVisibility(
      req.body.dreamId,
      req.body.visibility,
      session.user.email
    );

    res.setHeader("Content-Type", "application/json");
    res.status(200).end();

    return res;
  } catch (error) {
    logError({
      ...error,
      service: "api",
      pathname: "/api/data/publish",
      method: "patch",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}
