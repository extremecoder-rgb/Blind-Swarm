import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import crypto from 'crypto';

// Setup noble-ed25519 with sha512 for sync/async compliance
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

/**
 * Verifies a standard Ed25519 signature
 */
export async function verifySignature(
  publicKeyHex: string,
  message: string,
  signatureHex: string
): Promise<boolean> {
  try {
    const publicKey = hexToUint8Array(publicKeyHex);
    const signature = hexToUint8Array(signatureHex);
    const messageBytes = new TextEncoder().encode(message);
    
    return await ed.verify(signature, messageBytes, publicKey);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Verifies a signature specifically using the Midnight network's curve/format
 * In this production implementation, we use Ed25519 as the primary cryptographic primitive
 * for the multi-agent attestations.
 */
export async function verifyMidnightSignature(
  publicKey: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array
): Promise<boolean> {
  try {
    return await ed.verify(signature, message, publicKey);
  } catch (error) {
    console.error('Midnight signature verification error:', error);
    return false;
  }
}

/**
 * Sign a message using a private key
 */
export async function signMessage(
  privateKeyHex: string,
  message: string
): Promise<string> {
  const privateKey = hexToUint8Array(privateKeyHex);
  const messageBytes = new TextEncoder().encode(message);
  const signature = await ed.sign(messageBytes, privateKey);
  return uint8ArrayToHex(signature);
}

/**
 * Generate a new random keypair
 */
export async function generateKeypair(): Promise<{ publicKey: string; privateKey: string }> {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  return {
    publicKey: uint8ArrayToHex(publicKey),
    privateKey: uint8ArrayToHex(privateKey),
  };
}

export function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(Buffer.from(hex, 'hex'));
}

export function uint8ArrayToHex(arr: Uint8Array): string {
  return Buffer.from(arr).toString('hex');
}
