"use strict";

import { CRYPTO_IV, CRYPTO_KEY } from "@muahub/constants/MainContent";
import CryptoJS from "crypto-js";

const key = CryptoJS.enc.Hex.parse(CRYPTO_KEY);
const iv = CryptoJS.enc.Hex.parse(CRYPTO_IV);

export function encrypt(text) {
  const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv });
  return encrypted.toString();
}

export function decrypt(encryptedText) {
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, { iv: iv });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
