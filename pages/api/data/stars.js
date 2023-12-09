// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getServerSession } from "../../../lib/auth";
import { starDream, unstarDream } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";

/**
 * This endpoint is used to star and unstar dreams.
 * To star a dream means to save it to a user's list of starred/saved dreams.
 * This endpoint only supports POST and DELETE.
 */
function starsHandler(req, res) {
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

  if (!req.body.dreamId) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  const data = {
    dreamId: req.body.dreamId,
    session,
  };

  try {
    const result = await starDream(data);

    const objectId = result.insertedId.toString();

    res.setHeader("Content-Type", "application/json");
    res.status(201).send({ objectId });

    return res;
  } catch (error) {
    console.error({
      error,
      service: "api",
      pathname: "/api/data/stars",
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

  if (!req.body?.dreamId) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  const data = {
    dreamId: req.body.dreamId,
    session,
  };

  try {
    const result = await unstarDream(data);

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(result);

    return res;
  } catch (error) {
    console.error({
      error,
      service: "api",
      pathname: "/api/data/stars",
      method: "delete",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

export default starsHandler;
