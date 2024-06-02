/** @module api/data/completions-review */
import { getPostById, hasAiCommentedOnPost } from "../../../lib/db/reads";
import { createAIComment, generateCompletion } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
} from "../../../lib/errors";

/**
 * This endpoint is hit by Chiron after a review is completed.
 * To learn more about Chiron, visit:
 * @link https://github.com/eutiveumsonho/chiron
 */
function completionsReviewHandler(req, res) {
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
  if (!req.body?.completion || !req.body?.dreamId) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  const hasCommented = await hasAiCommentedOnPost(req.body.dreamId);

  if (hasCommented) {
    res.setHeader("Content-Type", "application/json");
    res.status(200).send("OK");
    return res;
  }

  const { completion, dreamId } = req.body;

  if (req.body?.skip) {
    console.log("Skipping completion review");
    res.setHeader("Content-Type", "application/json");
    res.status(202).send("Accepted");
    return res;
  }

  try {
    // The "approved" property is always set by a human to `true` through Chiron,
    // while "pendingReview" is set to `false`, also by a human.
    // See https://github.com/eutiveumsonho/internal-docs for more details about
    // this workflow.
    if (!req.body.pendingReview && !req.body.approved) {
      const dreamData = await getPostById(dreamId);

      console.log("Generating completion from workflow #2");
      await generateCompletion(
        dreamId,
        dreamData.dream.text,
        undefined,
        dreamData.userId
      );

      res.setHeader("Content-Type", "application/json");
      res.status(202).send("Accepted");

      return res;
    }

    // TODO: Update the reviewed completion

    // Once the completion is approved, we can generate a comment.
    await createAIComment(completion.choices[0].message.content, dreamId);

    res.setHeader("Content-Type", "application/json");
    res.status(201).send("Created");

    return res;
  } catch (error) {
    console.error({
      error,
      service: "api",
      pathname: "/api/data/completions-review",
      method: "post",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

export default completionsReviewHandler;
