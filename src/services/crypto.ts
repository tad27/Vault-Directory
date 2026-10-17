/**
 * Web Crypto API client-side encryption module
 * Uses AES-GCM (256-bit) with PBKDF2 key derivation (100,000 iterations, SHA-256)
 */

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;

// Convert ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to ArrayBuffer
export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate random salt
export function generateSalt(length = 16): string {
  const salt = crypto.getRandomValues(new Uint8Array(length));
  return bufferToBase64(salt.buffer);
}

// Derive AES-GCM CryptoKey from password and salt using PBKDF2
async function deriveKey(password: string, salt: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  const saltBuffer = base64ToBuffer(salt);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Hash a passcode with a salt for authentication check (PBKDF2 SHA-256)
 */
export async function hashPasscode(passcode: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passcode),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: base64ToBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  return bufferToBase64(bits);
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
  v: number; // schema version
}

/**
 * Encrypt plaintext string with a password/passphrase
 */
export async function encryptText(plainText: string, password: string, existingSalt?: string): Promise<EncryptedPayload> {
  const salt = existingSalt || generateSalt();
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const enc = new TextEncoder();

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    enc.encode(plainText)
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer),
    salt,
    v: 1,
  };
}

/**
 * Decrypt ciphertext string with a password/passphrase
 */
export async function decryptText(payload: EncryptedPayload, password: string): Promise<string> {
  try {
    const key = await deriveKey(password, payload.salt);
    const ivBuffer = base64ToBuffer(payload.iv);
    const cipherBuffer = base64ToBuffer(payload.ciphertext);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(ivBuffer),
      },
      key,
      cipherBuffer
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch {
    throw new Error('Decryption failed. Incorrect passcode or corrupted data.');
  }
}

/**
 * Encrypt any JSON-serializable object
 */
export async function encryptObject<T>(data: T, password: string): Promise<EncryptedPayload> {
  const jsonStr = JSON.stringify(data);
  return encryptText(jsonStr, password);
}

/**
 * Decrypt and parse JSON object
 */
export async function decryptObject<T>(payload: EncryptedPayload, password: string): Promise<T> {
  const jsonStr = await decryptText(payload, password);
  return JSON.parse(jsonStr) as T;
}
