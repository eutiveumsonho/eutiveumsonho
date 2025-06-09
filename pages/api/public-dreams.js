/** @module pages/api/public-dreams */
import { getLatestPublicPosts, getUserById, searchPosts } from "../../lib/db/reads";
import { BAD_REQUEST, METHOD_NOT_ALLOWED, SERVER_ERROR } from "../../lib/errors";
import { logError } from "../../lib/o11y/log";

/**
 * Public API route for getting public dreams without authentication.
 * Supports GET method for fetching latest dreams or searching dreams.
 */
function publicDreamsHandler(req, res) {
  switch (req.method) {
    case "GET":
      return get(req, res);
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(METHOD_NOT_ALLOWED);
      return res;
  }
}

async function get(req, res) {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    let result;
    
    if (query) {
      // Search for dreams
      result = await searchPosts(query);
      // Limit search results
      result = result.slice(0, parseInt(limit, 10));
    } else {
      // Get latest public dreams
      const currentPage = parseInt(page, 10);
      const pageLimit = parseInt(limit, 10);
      result = await getLatestPublicPosts({ page: currentPage, limit: pageLimit });
    }

    const dreams = [];

    if (result) {
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
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(dreams);

    return res;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/public-dreams",
      method: "get",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

export default publicDreamsHandler;