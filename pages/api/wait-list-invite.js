// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { sendEmail } from "../../lib/clients/mailgun";
import { WAIT_LIST_HTML } from "../../lib/email";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
} from "../../lib/errors";
import { logError } from "../../lib/o11y";

export default async function handler(req, res) {
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

  const subject = "Lista de espera";
  const html = WAIT_LIST_HTML;

  try {
    await Promise.all([
      sendEmail({
        to: "marcelo@eutiveumsonho.com",
        subject: `${subject} - user-inclusion`,
        text: email,
      }),
      sendEmail({ to: email, subject, html }),
    ]);

    res.setHeader("Content-Type", "application/json");
    res.status(201).end();

    return res;
  } catch (error) {
    logError({
      ...error,
      service: "api",
      pathname: "/api/wait-list-invite",
      method: "get",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}
