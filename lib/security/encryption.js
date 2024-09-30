// Adapted from https://www.tutorialspoint.com/encrypt-and-decrypt-data-in-nodejs#:~:text=NodeJS%20provides%20inbuilt%20library%20crypto,multiple%20crypto%20algorithms%20for%20encryption.
import crypto from "crypto";
import { logError } from "../o11y/log";
const algorithm = "aes-256-cbc";

/**
 * How this encryption key was generated 👇
 *
 * @example
 * import crypto from "crypto";
 *
 * crypto.randomBytes(32).toString('hex');
 */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY.substring(0, 32);

if (!ENCRYPTION_KEY) {
  throw new Error("Please add your encryption key to .env");
}

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return { iv: iv.toString("hex"), data: encrypted.toString("hex") };
}

export function decrypt(text) {
  try {
    const iv = Buffer.from(text.iv, "hex");
    const encryptedText = Buffer.from(text.data, "hex");
    const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    logError(error, {
      component: "decrypt",
    });

    return "";
  }
}
