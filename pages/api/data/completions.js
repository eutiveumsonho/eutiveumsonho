// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getServerSession } from "../../../lib/auth";
import { hasCommentedOnDream } from "../../../lib/db/reads";
import { generateCompletion } from "../../../lib/db/writes";
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

  const hasCommented = await hasCommentedOnDream("Sonia", req.body.dreamId);

  if (hasCommented) {
    res.setHeader("Content-Type", "application/json");
    res.status(200).send("OK");
    return res;
  }

  try {
    generateCompletion(req.body.dreamId, req.body.text, session);

    res.setHeader("Content-Type", "application/json");
    res.status(202).send("Accepted");

    return res;
  } catch (error) {
    logError({
      error,
      service: "api",
      pathname: "/api/data/completions",
      method: "post",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

export default withTracing(handler);
