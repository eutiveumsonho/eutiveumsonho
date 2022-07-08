// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { BAD_REQUEST, METHOD_NOT_ALLOWED } from "../../utils/errors";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end(METHOD_NOT_ALLOWED);
    return res;
  }

  if (!req.body.email) {
    res.status(400).end(BAD_REQUEST);
    return res;
  }

  const { email } = req.body;

  console.log({ email });

  res.setHeader("Content-Type", "application/json");
  res.status(201).end();

  return res;
}
