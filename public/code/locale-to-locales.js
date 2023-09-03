const fs = require("fs");
const path = require("path");

function translateAndSaveJSON(filename, originalJSON) {
  // Mock translations (replace this with real translation service)
  const translations = {
    en: {
      enter: "Enter",
      "valid-email": "Insert a valid email",
      email: "Your email",
      sending: "Sending...",
      send: "Send email with login link",
      "enter-with": "Enter with",
    },
    fr: {
      enter: "Entrer",
      "valid-email": "Insérez un e-mail valide",
      email: "Votre e-mail",
      sending: "Envoi...",
      send: "Envoyer un e-mail avec le lien de connexion",
      "enter-with": "Entrer avec",
    },
    es: {
      enter: "Entrar",
      "valid-email": "Inserte un correo electrónico válido",
      email: "Su correo electrónico",
      sending: "Enviando...",
      send: "Enviar correo electrónico con enlace de inicio de sesión",
      "enter-with": "Entrar con",
    },
  };

  // Loop through each language to create JSON files
  for (const [lang, trans] of Object.entries(translations)) {
    const filePath = path.join(
      __dirname,
      `/public/locales/${lang}/${filename}.json`
    );
    fs.writeFileSync(filePath, JSON.stringify(trans, null, 4), "utf8");
    console.log(`File saved: ${filePath}`);
  }
}

// Usage example
// const originalJSON = {
//   enter: "Entrar",
//   "valid-email": "Insira um e-mail válido",
//   email: "Seu e-mail",
//   sending: "Enviando...",
//   send: "Enviar e-mail com link de login",
//   "enter-with": "Entre com",
// };

// translateAndSaveJSON("translations", originalJSON);
