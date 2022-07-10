// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { sendEmail } from "../../clients/mailgun";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
} from "../../lib/errors";

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
  const html = `<h1>Bem vindo a lista de espera da maior comunidade de pessoas sonhadoras do Brasil! 
  Nossa previsao de lancamento da versao beta esta para o dia 25 de Julho. 
  Neste dia, voce recebera um email para se cadastrar na comunidade. 
  Aos poucos, e com o seu feedback, evoluiremos a comunidade. 
  Voce nunca precisara pagar nada, e os seus dados estarao bem protegidos.</h1>`;

  try {
    await Promise.all([
      sendEmail({
        to: "marcelo@eutiveumsonho.com",
        subject: `${subject} - inclusao de usuario`,
        text: email,
      }),
      sendEmail({ to: email, subject, html }),
    ]);

    res.setHeader("Content-Type", "application/json");
    res.status(201).end();

    return res;
  } catch (error) {
    console.error(error);
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}
