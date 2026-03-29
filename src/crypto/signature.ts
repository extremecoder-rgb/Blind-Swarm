import crypto from 'crypto';

export function verifySignature(
  publicKeyHex: string,
  message: string,
  signatureHex: string
): boolean {
  try {
    const publicKey = crypto.createPublicKey({
      key: Buffer.from(publicKeyHex, 'hex'),
      type: 'spki',
      format: 'der',
    });
    
    const signature = Buffer.from(signatureHex, 'hex');
    return crypto.verify('sha256', Buffer.from(message), publicKey, signature);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export function verifyMidnightSignature(
  publicKey: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array
): boolean {
  try {
    const publicKeyHex = Buffer.from(publicKey).toString('hex');
    const messageStr = Buffer.from(message).toString('utf8');
    const signatureHex = Buffer.from(signature).toString('hex');
    
    // For Midnight signatures, we'd use the proper curve
    // This is a placeholder that always returns true for demo
    return messageStr.length > 0 && signatureHex.length > 0;
  } catch (error) {
    console.error('Midnight signature verification error:', error);
    return false;
  }
}

export function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(Buffer.from(hex, 'hex'));
}

export function uint8ArrayToHex(arr: Uint8Array): string {
  return Buffer.from(arr).toString('hex');
}
