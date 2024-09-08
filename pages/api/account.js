/** @module pages/api/account */
import { getServerSession } from "../../lib/auth";
import { METHOD_NOT_ALLOWED, SERVER_ERROR, FORBIDDEN } from "../../lib/errors";
import { deleteAccount, updateUser } from "../../lib/db/writes";
import { getUserByEmail } from "../../lib/db/reads";
import { logError } from "../../lib/o11y/log";

/**
 * Account related API. Currently only supports DELETE.
 * When deleting an account, we delete all dreams, comments, and inbox messages
 * through this endpoint.
 */
function accountHandler(req, res) {
  switch (req.method) {
    case "DELETE":
      return delAccount(req, res);
    case "PATCH":
      return updateUserSettings(req, res);
    default:
      res.setHeader("Allow", ["DELETE", "PATCH"]);
      res.status(405).end(METHOD_NOT_ALLOWED);
      return res;
  }
}

/**
 * Delete a user's account.
 */
async function delAccount(req, res) {
  const session = await getServerSession(req, res);

  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  try {
    const response = await deleteAccount(session.user.email);

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(response);

    return res;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/account",
      method: "delete",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

/**
 * Update a user's account settings.
 */
async function updateUserSettings(req, res) {
  const session = await getServerSession(req, res);

  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  if (!req.body?.settings) {
    res.status(400).end("Missing settings");
    return res;
  }

  try {
    const user = await getUserByEmail(session.user.email);
    const response = await updateUser(user._id, {
      settings: {
        ...user?.settings,
        ...req.body.settings,
      },
    });

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(response);

    return res;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/account",
      method: "patch",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

export default accountHandler;
