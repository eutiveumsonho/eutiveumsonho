/** @module pages/api/data/claim-anonymous */
import { getServerSession } from "../../../lib/auth";
import { getPostsCollection } from "../../../lib/db/mongodb";
import { getUserByEmail } from "../../../lib/db/reads";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";
import { logError } from "../../../lib/o11y/log";
import { ObjectID } from "bson";

/**
 * This endpoint allows authenticated users to claim anonymous dreams
 * by providing the anonymous keys stored in their localStorage.
 */
function claimAnonymousHandler(req, res) {
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
 * Claims anonymous dreams for a user
 */
async function post(req, res) {
  const session = await getServerSession(req, res);

  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  if (!req.body?.anonymousKeys || !Array.isArray(req.body.anonymousKeys)) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    const collection = await getPostsCollection();
    const user = await getUserByEmail(session.user.email);

    let claimedCount = 0;

    // Process each anonymous key
    for (const anonymousKey of req.body.anonymousKeys) {
      // Find the anonymous dream with this key
      const dream = await collection.findOne({
        anonymousKey,
        isAnonymous: true,
      });

      if (dream && !dream.userId) {
        // Claim the dream by adding the user ID and removing anonymous flags
        await collection.updateOne(
          { _id: dream._id },
          {
            $set: {
              userId: ObjectID(user._id),
              lastUpdatedAt: new Date().toISOString(),
            },
            $unset: {
              anonymousKey: "",
              isAnonymous: "",
            },
          }
        );
        claimedCount++;
      }
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).send({ 
      success: true, 
      claimedCount 
    });

    return res;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data/claim-anonymous",
      method: "post",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

export default claimAnonymousHandler;