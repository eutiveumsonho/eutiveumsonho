// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getServerSession } from "../../../lib/auth";
import {
  deleteAllInboxMessages,
  deleteSomeInboxMessages,
  markAllInboxMessagesAsRead,
  markSomeInboxMessagesAsRead,
} from "../../../lib/db/writes";
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
    case "PATCH":
      return patch(req, res);
    case "DELETE":
      return del(req, res);
    default:
      res.setHeader("Allow", ["PATCH", "DELETE"]);
      res.status(405).end(METHOD_NOT_ALLOWED);
      return res;
  }
}

/**
 * @private
 */
async function patch(req, res) {
  const session = await getServerSession(req, res);

  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  if (!req.body?.inboxIds) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    if (req.body?.all) {
      await markAllInboxMessagesAsRead(session.user.email);

      res.setHeader("Content-Type", "application/json");
      res.status(201).send({});

      return res;
    }

    await markSomeInboxMessagesAsRead(req.body.inboxIds);

    res.setHeader("Content-Type", "application/json");
    res.status(201).send({});

    return res;
  } catch (error) {
    logError({
      error,
      service: "api",
      pathname: "/api/data/inbox",
      method: "patch",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

/**
 * @private
 */
async function del(req, res) {
  const session = await getServerSession(req, res);

  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  if (!req.body?.inboxIds) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    if (req.body?.all) {
      await deleteAllInboxMessages(session.user.email);

      res.setHeader("Content-Type", "application/json");
      res.status(201).send({});

      return res;
    }

    await deleteSomeInboxMessages(req.body.inboxIds);

    res.setHeader("Content-Type", "application/json");
    res.status(201).send({});

    return res;
  } catch (error) {
    logError({
      error,
      service: "api",
      pathname: "/api/data/inbox",
      method: "delete",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

export default withTracing(handler);
