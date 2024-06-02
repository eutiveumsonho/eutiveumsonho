import { decrypt, encrypt } from "./encryption";

export function decryptPost(post) {
  return {
    text: decrypt(post.text),
    html: decrypt(post.html),
  };
}

export function encryptPost(post) {
  return {
    text: encrypt(post.text),
    html: encrypt(post.html),
  };
}
