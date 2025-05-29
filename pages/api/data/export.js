/** @module pages/api/data/export */
import { getServerSession } from "../../../lib/auth";
import { getPosts } from "../../../lib/db/posts/reads";
import { getUserByEmail } from "../../../lib/db/reads";
import { html } from "../../../lib/email";
import {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  SERVER_ERROR,
  FORBIDDEN,
} from "../../../lib/errors";
import { logError } from "../../../lib/o11y/log";
import nodemailer from "nodemailer";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import "dayjs/locale/fr";

dayjs.extend(LocalizedFormat);

/**
 * API endpoint for exporting user dreams to email
 * Supports POST method to send dreams export to user's email
 */
function exportHandler(req, res) {
  switch (req.method) {
    case "POST":
      return post(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(METHOD_NOT_ALLOWED);
      return res;
  }
}

async function post(req, res) {
  const session = await getServerSession(req, res);

  if (!session) {
    res.status(403).end(FORBIDDEN);
    return res;
  }

  try {
    // Get user's dreams
    const dreams = await getPosts(session.user.email);
    
    if (!dreams || dreams.length === 0) {
      res.status(400).json({ error: "No dreams found to export" });
      return res;
    }

    // Get user info for personalization
    const user = await getUserByEmail(session.user.email);
    
    // Generate email content
    const emailContent = generateEmailContent(dreams, user, req.query.locale || 'en');
    
    // Send email
    await sendExportEmail(session.user.email, emailContent, req.query.locale || 'en');

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ success: true, message: "Dreams exported successfully" });

    return res;
  } catch (error) {
    logError(error, {
      service: "api",
      pathname: "/api/data/export",
      method: "post",
    });
    res.status(500).end(SERVER_ERROR);

    return res;
  }
}

function generateEmailContent(dreams, user, locale) {
  const dreamsCount = dreams.length;
  const totalWords = dreams.reduce((acc, dream) => {
    return acc + (dream.characterCount || 0);
  }, 0);

  // Localized content
  const content = getLocalizedContent(locale);
  
  let dreamsHtml = '';
  
  dreams.forEach((dream, index) => {
    const date = dayjs(dream.createdAt).locale(locale).format("LL");
    const visibility = getVisibilityText(dream.visibility, locale);
    
    dreamsHtml += `
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">
          <h3 style="margin: 0; color: #333; font-size: 16px;">${content.dream} #${index + 1}</h3>
          <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 12px; color: #666;">
            <span>${date}</span>
            <span style="margin-top: 2px; font-style: italic;">${visibility}</span>
          </div>
        </div>
        <div style="line-height: 1.6; color: #333;">
          ${dream.dream.html || dream.dream.text}
        </div>
      </div>
    `;
  });

  const mainContent = `
    <h1 style="color: #3498db; text-align: center; margin-bottom: 30px;">${content.title}</h1>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
      <h2 style="color: #333; margin-top: 0; font-size: 18px;">${content.summary}</h2>
      <p style="margin: 10px 0;"><strong>${content.totalDreams}:</strong> ${dreamsCount}</p>
      <p style="margin: 10px 0;"><strong>${content.totalCharacters}:</strong> ${totalWords.toLocaleString()}</p>
      <p style="margin: 10px 0;"><strong>${content.exportDate}:</strong> ${dayjs().locale(locale).format("LL")}</p>
    </div>
    
    <h2 style="color: #333; font-size: 18px; margin-bottom: 20px;">${content.yourDreams}</h2>
    
    ${dreamsHtml}
    
    <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 5px; text-align: center;">
      <p style="margin: 0; color: #666; font-style: italic;">${content.footer}</p>
    </div>
  `;

  return html(
    mainContent,
    content.emailTitle,
    null,
    locale
  );
}

function getLocalizedContent(locale) {
  const translations = {
    en: {
      title: "Your Dreams Export",
      emailTitle: "Dreams Export - Eu Tive Um Sonho",
      summary: "Export Summary",
      totalDreams: "Total Dreams",
      totalCharacters: "Total Characters",
      exportDate: "Export Date",
      yourDreams: "Your Dreams",
      dream: "Dream",
      footer: "Keep dreaming and sharing your experiences with our community!",
      private: "Private",
      public: "Public",
      anonymous: "Anonymous"
    },
    pt: {
      title: "Exportação dos Seus Sonhos",
      emailTitle: "Exportação de Sonhos - Eu Tive Um Sonho",
      summary: "Resumo da Exportação",
      totalDreams: "Total de Sonhos",
      totalCharacters: "Total de Caracteres",
      exportDate: "Data da Exportação",
      yourDreams: "Seus Sonhos",
      dream: "Sonho",
      footer: "Continue sonhando e compartilhando suas experiências com nossa comunidade!",
      private: "Privado",
      public: "Público",
      anonymous: "Anônimo"
    },
    es: {
      title: "Exportación de Tus Sueños",
      emailTitle: "Exportación de Sueños - Eu Tive Um Sonho",
      summary: "Resumen de Exportación",
      totalDreams: "Total de Sueños",
      totalCharacters: "Total de Caracteres",
      exportDate: "Fecha de Exportación",
      yourDreams: "Tus Sueños",
      dream: "Sueño",
      footer: "¡Sigue soñando y compartiendo tus experiencias con nuestra comunidad!",
      private: "Privado",
      public: "Público",
      anonymous: "Anónimo"
    },
    fr: {
      title: "Exportation de Vos Rêves",
      emailTitle: "Exportation de Rêves - Eu Tive Um Sonho",
      summary: "Résumé d'Exportation",
      totalDreams: "Total des Rêves",
      totalCharacters: "Total des Caractères",
      exportDate: "Date d'Exportation",
      yourDreams: "Vos Rêves",
      dream: "Rêve",
      footer: "Continuez à rêver et à partager vos expériences avec notre communauté!",
      private: "Privé",
      public: "Public",
      anonymous: "Anonyme"
    }
  };

  return translations[locale] || translations.en;
}

function getVisibilityText(visibility, locale) {
  const content = getLocalizedContent(locale);
  return content[visibility] || visibility;
}

async function sendExportEmail(email, htmlContent, locale) {
  // Create transporter (using same config as existing email system)
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const content = getLocalizedContent(locale);

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: content.emailTitle,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
}

export default exportHandler;