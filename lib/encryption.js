import crypto from "crypto";
const algorithm = "aes-256-cbc";
const key = process.env.ENCRYPTION_KEY;

if (!key) {
  throw new Error("Please add your encryption key to .env");
}

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return { iv: iv.toString("hex"), data: encrypted.toString("hex") };
}

export function decrypt(text) {
  const iv = Buffer.from(text.iv, "hex");
  const encryptedText = Buffer.from(text.data, "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
