/** @module pages/api/data/anonymous */
import { getPostsCollection } from "../../../lib/db/mongodb";
import { getInsights } from "../../../lib/data-analysis/word-frequency";
import { combineLocationData, inferLocationFromHeaders } from "../../../lib/location";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
} from "../../../lib/errors";
import { logError } from "../../../lib/o11y/log";
import { ObjectID } from "bson";
import { randomBytes } from 'crypto';

/**
 * This endpoint handles anonymous dream publishing.
 * Allows visitors to create dreams without requiring authentication.
 * Each anonymous dream gets a unique key for later retrieval.
 */
function anonymousHandler(req, res) {
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
 * Creates an anonymous dream
 */
async function post(req, res) {
  if (!req.body?.dream?.text || !req.body?.dream?.html) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    // Generate unique anonymous key
    const anonymousKey = randomBytes(32).toString('hex');

    // Handle location data
    const clientLocation = req.body.location;
    const inferredLocation = inferLocationFromHeaders(req);
    const finalLocation = combineLocationData(clientLocation, inferredLocation);

    const collection = await getPostsCollection();
    const insights = getInsights(req.body.dream.text);

    const result = await collection.insertOne({
      dream: req.body.dream,
      anonymousKey,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      visibility: "public", // Anonymous dreams are public by default
      commentCount: 0,
      starCount: 0,
      isAnonymous: true,
      ...(finalLocation && { location: finalLocation }),
      ...insights,
    });

    const objectId = result.insertedId.toString();

    res.setHeader("Content-Type", "application/json");
    res.status(201).send({ 
      objectId, 
      anonymousKey,
      success: true 
    });

    return res;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data/anonymous",
      method: "post",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

export default anonymousHandler;