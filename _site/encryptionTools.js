// Check if we're in Node.js environment
const isNode = typeof window === 'undefined';

// Import crypto appropriately based on environment
let crypto, TextEncoder, TextDecoder;

if (isNode) {
  // Node.js environment
  const nodeCrypto = await import('node:crypto');
  crypto = nodeCrypto.webcrypto || nodeCrypto.default.webcrypto;
  TextEncoder = globalThis.TextEncoder;
  TextDecoder = globalThis.TextDecoder;
} else {
  // Browser environment
  crypto = window.crypto;
  TextEncoder = window.TextEncoder;
  TextDecoder = window.TextDecoder;
}

async function encrypt(content, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await getKey(password, salt);

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const contentBytes = stringToBytes(content);

  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, contentBytes)
  );

  return {
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    cipher: bytesToBase64(cipher),
  };
}

async function decrypt(encryptedData, password) {
  const salt = base64ToBytes(encryptedData.salt);

  const key = await getKey(password, salt);

  const iv = base64ToBytes(encryptedData.iv);

  const cipher = base64ToBytes(encryptedData.cipher);

  const contentBytes = new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher)
  );

  return bytesToString(contentBytes);
}

async function getKey(password, salt) {
  const passwordBytes = stringToBytes(password);

  const initialKey = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    initialKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// conversion helpers

function bytesToString(bytes) {
  return new TextDecoder().decode(bytes);
}

function stringToBytes(str) {
  return new TextEncoder().encode(str);
}

function bytesToBase64(arr) {
  if (isNode) {
    // Node.js Buffer approach
    return Buffer.from(arr).toString('base64');
  } else {
    // Browser btoa approach
    return btoa(Array.from(arr, (b) => String.fromCharCode(b)).join(""));
  }
}

function base64ToBytes(base64) {
  if (isNode) {
    // Node.js Buffer approach
    return new Uint8Array(Buffer.from(base64, 'base64'));
  } else {
    // Browser atob approach
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  }
}

export const encryptionTools = { encrypt, decrypt, getKey, bytesToString, stringToBytes, bytesToBase64, base64ToBytes };
