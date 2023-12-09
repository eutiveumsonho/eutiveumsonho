import NextAuth from "next-auth";
// import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import { createTransport } from "nodemailer";
import { html } from "../../../lib/email";
import { ALLOWED_HOST, BRAND_HEX } from "../../../lib/config";

const i18n = (url) => ({
  pt: {
    mainContent: `<p>Aqui está um link para entrar no Eu tive um sonho.</p>
    <p>Esse link só pode ser utilizado uma vez e expira depois de 24 horas.</p>
    <p>Caso o link tenha expirado, por favor tente entrar novamente, <a href="${ALLOWED_HOST}">clicando aqui</a></p>
<tr>
  <td align="center" style="padding: 20px 0;">
    <table border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="border-radius: 5px;" bgcolor="${BRAND_HEX}"><a href="${url}"
            target="_blank"
            style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: white; text-decoration: none; border-radius: 5px; padding: 10px 20px; display: inline-block; font-weight: bold;">Entrar agora</a></td>
      </tr>
    </table>
  </td>
</tr>`,
    title: "Entrar no Eu tive um sonho",
    footerContent: "<p>Se você não solicitou este e-mail, pode ignorá-lo.</p>",
  },
  en: {
    mainContent: `<p>Here's a link to sign in to Eu tive um sonho.</p>
    <p>This link can only be used once and expires after 24 hours.</p>
    <p>If the link has expired, please try to sign in again, <a href="${ALLOWED_HOST}">click here</a></p>
<tr>
  <td align="center" style="padding: 20px 0;">
    <table border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="border-radius: 5px;" bgcolor="${BRAND_HEX}"><a href="${url}"
            target="_blank"
            style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: white; text-decoration: none; border-radius: 5px; padding: 10px 20px; display: inline-block; font-weight: bold;">Sign in</a></td>
      </tr>
    </table>
  </td>
</tr>`,
    title: "Sign in to Eu tive um sonho",
    footerContent:
      "<p>If you did not request this email, you can ignore it.</p>",
  },
  es: {
    mainContent: `<p>Aquí tienes un enlace para entrar a Eu tive um sonho.</p>
    <p>Este enlace solo puede ser utilizado una vez y expira después de 24 horas.</p>
    <p>Si el enlace ha expirado, por favor intenta ingresar nuevamente, <a href="${ALLOWED_HOST}">haz clic aquí</a></p>
<tr>
  <td align="center" style="padding: 20px 0;">
    <table border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="border-radius: 5px;" bgcolor="${BRAND_HEX}"><a href="${url}"
            target="_blank"
            style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: white; text-decoration: none; border-radius: 5px; padding: 10px 20px; display: inline-block; font-weight: bold;">Entrar ahora</a></td>
      </tr>
    </table>
  </td>
</tr>`,
    title: "Entrar a Eu tive um sonho",
    footerContent:
      "<p>Si no solicitaste este correo electrónico, puedes ignorarlo.</p>",
  },
  fr: {
    mainContent: `<p>Voici un lien pour vous connecter à Eu tive um sonho.</p>
    <p>Ce lien ne peut être utilisé qu'une fois et expire après 24 heures.</p>
    <p>Si le lien a expiré, veuillez essayer de vous reconnecter, <a href="${ALLOWED_HOST}">cliquez ici</a></p>
<tr>
  <td align="center" style="padding: 20px 0;">
    <table border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="border-radius: 5px;" bgcolor="${BRAND_HEX}"><a href="${url}"
            target="_blank"
            style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: white; text-decoration: none; border-radius: 5px; padding: 10px 20px; display: inline-block; font-weight: bold;">Se connecter</a></td>
      </tr>
    </table>
  </td>
</tr>`,
    title: "Se connecter à Eu tive um sonho",
    footerContent:
      "<p>Si vous n'avez pas demandé cet e-mail, vous pouvez l'ignorer.</p>",
  },
});

function extractLocaleFromQueryString(queryString) {
  const match = queryString.match(/locale=([^&]*)/);
  return match ? match[1] : null;
}

async function sendVerificationRequest(params) {
  const { identifier, url: rawUrl, provider } = params;

  const url = new URL(rawUrl);
  const { host, searchParams } = url;
  const transport = createTransport(provider.server);

  const locale = extractLocaleFromQueryString(searchParams.get("callbackUrl"));
  const data = i18n(url)[locale];
  const title = data.title;

  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: title,
    text: text({ url, host, title }),
    html: html(data.mainContent, title, data.footerContent, locale),
  });

  const failed = result.rejected.concat(result.pending).filter(Boolean);

  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
  }
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host, title }) {
  return `${title}: ${host}\n${url}\n\n`;
}

export const authOptions = {
  secret: process.env.AUTH_SECRET,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
    // TODO: Create OAuth account linkage workflow
    // https://stackoverflow.com/questions/71643948/nextauth-oauthaccountnotlinked-imported-data-from-another-website-autolink
    // FacebookProvider({
    //   clientId: process.env.AUTH_FACEBOOK_ID,
    //   clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    // }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    // signOut: '/auth/signout',
    error: "/auth/error", // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // (used for check email message)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
};

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth(authOptions);
