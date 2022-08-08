// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getDreamById } from "../../../lib/db/reads";
import { METHOD_NOT_ALLOWED, SERVER_ERROR } from "../../../lib/errors";

export default async function handler(req, res) {
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
  const { id } = req.query;

  console.log({ id });

  try {
    const result = await getDreamById(id);

    const { dream, userEmail } = result;

    res.setHeader("Content-Type", "application/json");
    res.status(201).send({ dream, userEmail });

    return res;
  } catch (error) {
    console.error(error);
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}
