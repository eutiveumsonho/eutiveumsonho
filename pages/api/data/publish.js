/** @module pages/api/data/publish */
import { getServerSession } from "../../../lib/auth";
import { updatePostVisibility } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";

/**
 * This endpoint is responsible for enabling users to control the visibility of their dreams.
 * To publish a dream means to make it visible to other users, either publicly visible,
 * or anonymously visible. Users can also hide dreams from other users ('private' is the defaut
 * visbility mode).
 */
function publishHandler(req, res) {
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
    await updatePostVisibility(
      req.body.dreamId,
      req.body.visibility,
      session.user.email
    );

    res.setHeader("Content-Type", "application/json");
    res.status(200).end();

    return res;
  } catch (error) {
    console.error({
      error,
      service: "api",
      pathname: "/api/data/publish",
      method: "patch",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

export default publishHandler;
