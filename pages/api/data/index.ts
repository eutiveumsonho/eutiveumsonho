/** @module pages/api/data */
import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { getServerSession } from "../../../lib/auth";
import { getUserById, searchPosts } from "../../../lib/db/reads";
import { createPost, deletePost, updatePost } from "../../../lib/db/writes";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";
import { logError } from "../../../lib/o11y/log";

// Types for request body
interface DreamData {
  dream: {
    text: string;
    html: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface PatchRequestBody {
  dreamId: string;
  dreamData: {
    dream: {
      text: string;
      html: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

interface PostRequestBody {
  dream: {
    text: string;
    html: string;
    [key: string]: any;
  };
}

interface DeleteRequestBody {
  dreamId: string;
}

/**
 * This is the main API route for getting, creating, updating, and deleting dreams.
 * It supports GET, POST, PATCH, and DELETE, allowing users to search for dreams,
 * create new dreams, update existing dreams, and delete dreams.
 */
function dataHandler(req: NextApiRequest, res: NextApiResponse) {
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

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res);
  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  const body = req.body as PatchRequestBody;
  if (
    !body?.dreamData?.dream?.text ||
    !body?.dreamData?.dream?.html ||
    !body?.dreamId
  ) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    await updatePost(body.dreamId, body.dreamData, session?.user?.email);
    res.setHeader("Content-Type", "application/json");
    res.status(200).end();
    return res;
  } catch (error) {
    logError(error, {
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
async function post(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res);
  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  const body = req.body as PostRequestBody;
  if (!body?.dream?.text || !body?.dream?.html) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  const data = { dream: body, session };
  try {
    const result = await createPost(data);
    const objectId = result.insertedId.toString();
    res.setHeader("Content-Type", "application/json");
    res.status(201).send({ objectId });
    return res;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data",
      method: "post",
    });
    res.status(500).end(SERVER_ERROR);
    return res;
  }
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res);
  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  const body = req.body as DeleteRequestBody;
  if (!body?.dreamId) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    const result = await deletePost(body.dreamId);
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(result);
    return res;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data",
      method: "delete",
    });
    res.status(500).end(SERVER_ERROR);
    return res;
  }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res);
  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  const { query } = req.query;
  if (!query) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  try {
    const result = await searchPosts(query);
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
    logError(error, {
      service: "api",
      pathname: "/api/data",
      method: "get",
    });
    res.status(500).end(SERVER_ERROR);
    return res;
  }
}

export default dataHandler;