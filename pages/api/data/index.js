/** @module pages/api/data */
import { getServerSession } from "../../../lib/auth";
import { getUserById, searchDreams } from "../../../lib/db/reads";
import { createDream, deleteDream, updateDream } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";

/**
 * This is the main API route for getting, creating, updating, and deleting dreams.
 * It supports GET, POST, PATCH, and DELETE, allowing users to search for dreams,
 * create new dreams, update existing dreams, and delete dreams.
 */
function dataHandler(req, res) {
  switch (req.method) {
    case "POST":
      return post(req, res);
    case "PATCH":
      return patch(req, res);
    case "DELETE":
      return del(req, res);
    case "GET":
      return get(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
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
    await updateDream(req.body.dreamId, req.body.dreamData, session.user.email);

    res.setHeader("Content-Type", "application/json");
    res.status(200).end();

    return res;
  } catch (error) {
    console.error({
      error,
      service: "api",
      pathname: "/api/data",
      method: "patch",
    });
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
    console.error({
      error,
      service: "api",
      pathname: "/api/data",
      method: "post",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

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

  try {
    const result = await deleteDream(req.body.dreamId);

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(result);

    return res;
  } catch (error) {
    console.error({
      error,
      service: "api",
      pathname: "/api/data",
      method: "delete",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

async function get(req, res) {
  const session = await getServerSession(req, res);

  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  if (!req.query?.query) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    const result = await searchDreams(req.query.query);

    const dreams = [];

    for (let dream of result) {
      if (dream.visibility === "anonymous") {
        delete dream.userId;
        dreams.push(dream);
        continue;
      }

      const user = await getUserById(dream.userId);
      dream.user = user;
      dreams.push(dream);
    }

    res.setHeader("Content-Type", "application/json");
    res.status(201).send(dreams);

    return res;
  } catch (error) {
    console.error({
      error,
      service: "api",
      pathname: "/api/data",
      method: "get",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

export default dataHandler;
