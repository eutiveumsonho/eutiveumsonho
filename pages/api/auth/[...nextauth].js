import NextAuth from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import { createTransport } from "nodemailer";
import { html } from "../../../lib/email";
import { ALLOWED_HOST, BRAND_HEX } from "../../../lib/config";

async function sendVerificationRequest(params) {
  const { identifier, url, provider } = params;
  const { host } = new URL(url);
  const transport = createTransport(provider.server);

  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: `Entrar no Eu tive um sonho`,
    text: text({ url, host }),
    html: formatMagicLinkHtml({ url, host }),
  });

  const failed = result.rejected.concat(result.pending).filter(Boolean);

  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
  }
}

function formatMagicLinkHtml(params) {
  const { url } = params;

  return html(
    `<p>Aqui está um link para entrar no Eu tive um sonho.</p>
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
    "Entrar no Eu tive um sonho",
    "<p>Se você não solicitou este e-mail, pode ignorá-lo.</p>"
  );
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host }) {
  return `Entre em ${host}\n${url}\n\n`;
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
    // GoogleProvider({
    //   clientId: process.env.AUTH_GOOGLE_ID,
    //   clientSecret: process.env.AUTH_GOOGLE_SECRET,
    // }),
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
