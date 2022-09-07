import { decrypt, encrypt } from "./encryption";

export function decryptDream(dream) {
  return {
    text: decrypt(dream.text),
    html: decrypt(dream.html),
  };
}

export function encryptDream(dream) {
  return {
    text: encrypt(dream.text),
    html: encrypt(dream.html),
  };
}
