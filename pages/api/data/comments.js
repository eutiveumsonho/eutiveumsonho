// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getServerSession } from "../../../lib/auth";
import { getComments } from "../../../lib/db/reads";
import { createComment, deleteComment } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";
import { logError } from "../../../lib/o11y";

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
      return post(req, res);
    case "DELETE":
      return del(req, res);
    case "GET":
      return get(req, res);
    default:
      res.setHeader("Allow", ["POST", "PATCH", "DELETE"]);
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

  if (!req.body?.comment || !req.body.dreamId) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  const data = {
    comment: req.body.comment,
    dreamId: req.body.dreamId,
    session,
  };

  try {
    const result = await createComment(data);

    const objectId = result.insertedId.toString();

    res.setHeader("Content-Type", "application/json");
    res.status(201).send({ objectId });

    return res;
  } catch (error) {
    logError({
      ...error,
      service: "api",
      pathname: "/api/data/comments",
      method: "post",
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

  if (!req.body?.commentId) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    const result = await deleteComment(req.body.commentId);

    res.setHeader("Content-Type", "application/json");
    res.status(201).send(result);

    return res;
  } catch (error) {
    logError({
      ...error,
      service: "api",
      pathname: "/api/data/comments",
      method: "delete",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

/**
 * @public
 */
async function get(req, res) {
  if (!req.query?.dreamId) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    const result = await getComments(req.query.dreamId);

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(result);

    return res;
  } catch (error) {
    logError({
      ...error,
      service: "api",
      pathname: "/api/data/comments",
      method: "get",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}
