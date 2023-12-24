/** @module pages/api/data/ai-comments */
import { getServerSession } from "../../../lib/auth";
import {
  getDreamById,
  getUserByEmail,
  hasAiCommentedOnDream,
} from "../../../lib/db/reads";
import { generateCompletion } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";

/**
 * This is the API route for creating a comment generated by AI.
 * Through this endpoint, this service hits OpenAI to generate a completion
 * and then saves it to the database, associating it with a comment.
 */
function completionsHandler(req, res) {
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

  const hasCommented = await hasAiCommentedOnDream(req.body.dreamId);
  const dreamData = await getDreamById(req.body.dreamId);
  const user = await getUserByEmail(session.user.email);

  if (
    dreamData?.visibility === "private" &&
    !user?.settings?.aiCommentsOnPrivatePosts
  ) {
    console.log(
      "Post visibility not public nor anonymous, and user settings for comments on private posts disabled. Not generating completion"
    );

    res.setHeader("Content-Type", "application/json");
    res.status(200).end("OK");
    return res;
  }

  if (hasCommented) {
    res.setHeader("Content-Type", "application/json");
    res.status(200).send("OK");
    return res;
  }

  try {
    console.log("Generating completion from workflow #1");
    await generateCompletion(req.body.dreamId, req.body.text, session);

    res.setHeader("Content-Type", "application/json");
    res.status(202).send("Accepted");

    return res;
  } catch (error) {
    console.error({
      error,
      service: "api",
      pathname: "/api/data/completions",
      method: "post",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

export default completionsHandler;
