export const METHOD_NOT_ALLOWED = "Method Not Allowed";
export const BAD_REQUEST = "Bad Request";
export const SERVER_ERROR = "Server Error";
export const FORBIDDEN = "Forbidden";

// Errors reference: https://next-auth.js.org/configuration/pages#error-codes
export const NEXT_AUTH_ERRORS = {
  OAuthSignin: {
    en: "Error in constructing an authorization URL (1, 2, 3)",
    pt: "Erro ao construir uma URL de autorização (1, 2, 3)",
    es: "Error al construir una URL de autorización (1, 2, 3)",
    fr: "Erreur lors de la construction d'une URL d'autorisation (1, 2, 3)",
  },
  OAuthCallback: {
    en: "Error in handling the response (1, 2, 3) from an OAuth provider.",
    pt: "Erro ao lidar com a resposta (1, 2, 3) de um provedor OAuth.",
    es: "Error al manejar la respuesta (1, 2, 3) de un proveedor de OAuth.",
    fr: "Erreur dans la gestion de la réponse (1, 2, 3) d'un fournisseur OAuth.",
  },
  OAuthCreateAccount: {
    en: "Could not create OAuth provider user in the database.",
    pt: "Não foi possível criar um usuário do provedor OAuth no banco de dados.",
    es: "No se pudo crear el usuario del proveedor OAuth en la base de datos.",
    fr: "Impossible de créer l'utilisateur du fournisseur OAuth dans la base de données.",
  },
  EmailCreateAccount: {
    en: "Could not create email provider user in the database.",
    pt: "Não foi possível criar um usuário do provedor de e-mail no banco de dados.",
    es: "No se pudo crear el usuario del proveedor de correo electrónico en la base de datos.",
    fr: "Impossible de créer l'utilisateur du fournisseur de courrier électronique dans la base de données.",
  },
  Callback: {
    en: "Error in the OAuth callback handler route",
    pt: "Erro na rota do manipulador de retorno de chamada OAuth",
    es: "Error en la ruta del manejador de devolución de llamada de OAuth",
    fr: "Erreur dans la route du gestionnaire de rappel OAuth",
  },
  OAuthAccountNotLinked: {
    en: "An account with this email already exists, but it is not linked to the provider (email, Google, Facebook) used to log in to the platform. Try logging in using the same provider you used the first time.",
    pt: "Uma conta com este e-mail já existe, mas não está associada ao provedor (e-mail, Google e Facebook) utilizado para entrar na plataforma. Tente entrar utilizando o mesmo provedor que você utilizou pela primeira vez.",
    es: "Una cuenta con este correo electrónico ya existe, pero no está asociada al proveedor (correo electrónico, Google, Facebook) utilizado para ingresar a la plataforma. Intente ingresar utilizando el mismo proveedor que utilizó por primera vez.",
    fr: "Un compte avec cet e-mail existe déjà, mais n'est pas associé au fournisseur (e-mail, Google, Facebook) utilisé pour se connecter à la plateforme. Essayez de vous connecter en utilisant le même fournisseur que vous avez utilisé la première fois.",
  },
  EmailSignin: {
    en: "Sending the email with the verification token failed",
    pt: "O envio do e-mail com o token de verificação falhou",
    es: "El envío del correo electrónico con el token de verificación falló",
    fr: "L'envoi de l'e-mail avec le jeton de vérification a échoué",
  },
  CredentialsSignin: {
    en: "The authorize callback returned null in the Credentials provider. We don't recommend providing information about which part of the credentials were wrong, as it might be abused by malicious hackers.",
    pt: "A função de retorno de chamada de autorização retornou nulo no provedor de Credenciais. Não recomendamos fornecer informações sobre qual parte das credenciais estava errada, pois isso pode ser explorado por hackers maliciosos.",
    es: "La devolución de llamada de autorización devolvió nulo en el proveedor de Credenciales. No recomendamos proporcionar información sobre qué parte de las credenciales estaba mal, ya que podría ser aprovechada por hackers maliciosos.",
    fr: "La fonction de rappel d'autorisation a renvoyé null dans le fournisseur de références. Nous ne recommandons pas de fournir des informations sur la partie des identifiants qui était incorrecte, car elle pourrait être exploitée par des pirates malveillants.",
  },
  SessionRequired: {
    en: "The content of this page requires you to be signed in at all times. See useSession for configuration.",
    pt: "O conteúdo desta página requer que você esteja logado o tempo todo. Veja useSession para configuração.",
    es: "El contenido de esta página requiere que esté conectado en todo momento. Consulte useSession para la configuración.",
    fr: "Le contenu de cette page nécessite que vous soyez connecté en permanence. Consultez useSession pour la configuration.",
  },
  Default: {
    en: "Unknown error",
    pt: "Erro desconhecido",
    es: "Error desconocido",
    fr: "Erreur inconnue",
  },
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
