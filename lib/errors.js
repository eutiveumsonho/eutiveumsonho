export const METHOD_NOT_ALLOWED = "Method Not Allowed";
export const BAD_REQUEST = "Bad Request";
export const SERVER_ERROR = "Server Error";
export const FORBIDDEN = "Forbidden";

// Errors reference: https://next-auth.js.org/configuration/pages#error-codes
// TODO: translate to pt-br
export const NEXT_AUTH_ERRORS = {
  OAuthSignin: "Error in constructing an authorization URL (1, 2, 3)",
  OAuthCallback:
    "Error in handling the response (1, 2, 3) from an OAuth provider.",
  OAuthCreateAccount: "Could not create OAuth provider user in the database.",
  EmailCreateAccount: "Could not create email provider user in the database.",
  Callback: "Error in the OAuth callback handler route",
  OAuthAccountNotLinked:
    "Uma conta com este e-mail já existe, mas não está associada ao provedor (e-mail, Google e Facebook) utilizado para entrar na plataforma. Tente entrar utilizando o mesmo provedor que você utilizou pela primeira vez.",
  EmailSignin: "Sending the e-mail with the verification token failed",
  CredentialsSignin:
    "The authorize callback returned null in the Credentials provider. We don't recommend providing information about which part of the credentials were wrong, as it might be abused by malicious hackers.",
  SessionRequired:
    "The content of this page requires you to be signed in at all times. See useSession for configuration.",
  Default: "Erro desconhecido",
};

// TODO: use to log on o11y platform
export const _NEXT_AUTH_ERRORS = {
  OAuthSignin: "Error in constructing an authorization URL (1, 2, 3)",
  OAuthCallback:
    "Error in handling the response (1, 2, 3) from an OAuth provider.",
  OAuthCreateAccount: "Could not create OAuth provider user in the database.",
  EmailCreateAccount: "Could not create email provider user in the database.",
  Callback: "Error in the OAuth callback handler route",
  OAuthAccountNotLinked:
    "If the email on the account is already linked, but not with this OAuth account",
  EmailSignin: "Sending the e-mail with the verification token failed",
  CredentialsSignin:
    "The authorize callback returned null in the Credentials provider. We don't recommend providing information about which part of the credentials were wrong, as it might be abused by malicious hackers.",
  SessionRequired:
    "The content of this page requires you to be signed in at all times. See useSession for configuration.",
  Default: "Catch all, will apply, if none of the above matched",
};
