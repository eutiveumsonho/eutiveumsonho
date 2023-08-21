import * as FormData from "form-data";
import Mailgun from "mailgun.js";
import { logError } from "../o11y";

const API_KEY = process.env.MAIL_GUN_API_KEY;
const DOMAIN = process.env.MAIL_GUN_DOMAIN;

const mailgun = new Mailgun(FormData);
const client = mailgun.client({
  username: "api",
  key: API_KEY,
});

export async function sendEmail(params) {
  const { to, subject, html, text } = params;

  const messageData = {
    from: "Eu tive um sonho <marcelo@eutiveumsonho.com>",
    to,
    subject,
    html,
    text,
  };

  try {
    const res = await client.messages.create(DOMAIN, messageData);

    return res;
  } catch (error) {
    logError({ error, service: "mailgun", component: "sendEmail" });
    throw error;
  }
}
