/** @module pages/api/data/comments */
import { getServerSession } from "../../../lib/auth";
import { createComment, deleteComment } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";

/**
 * This is the API route for managing comments.
 * It supports POST and DELETE, allowing users to create and delete their own comments.
 * Comments cannot be edited, and dream owners cannot delete comments from others (this is likely
 * changing in the near future).
 */
function commentsHandler(req, res) {
  switch (req.method) {
    case "POST":
      return post(req, res);
    case "DELETE":
      return del(req, res);
    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
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
    console.error({
      error,
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

  if (!req.body?.commentId || !req.body?.dreamId) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    const result = await deleteComment(req.body.commentId, req.body.dreamId);

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(result);

    return res;
  } catch (error) {
    console.error({
      error,
      service: "api",
      pathname: "/api/data/comments",
      method: "delete",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

export default commentsHandler;
