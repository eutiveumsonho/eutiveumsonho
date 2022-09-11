// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getServerSession } from "../../lib/auth";
import { METHOD_NOT_ALLOWED, SERVER_ERROR, FORBIDDEN } from "../../lib/errors";
import { deleteAccount } from "../../lib/db/writes";

export default async function handler(req, res) {
  switch (req.method) {
    case "DELETE":
      return del(req, res);
    default:
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).end(METHOD_NOT_ALLOWED);
      return res;
  }
}

async function del(req, res) {
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
    console.error(error);
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}
