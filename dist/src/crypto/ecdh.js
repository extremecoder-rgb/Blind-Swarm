import { createECDH, createCipheriv, createDecipheriv } from 'crypto';
export function generateECDHKeyPair() {
    const ecdh = createECDH('secp256k1');
    ecdh.generateKeys();
    return {
        publicKey: ecdh.getPublicKey(),
        privateKey: ecdh.getPrivateKey(),
    };
}
export function deriveSharedSecret(privateKey, publicKey) {
    const ecdh = createECDH('secp256k1');
    ecdh.setPrivateKey(privateKey);
    return ecdh.computeSecret(publicKey);
}
export function encryptWithKey(senderPrivateKey, recipientPublicKey, plaintext) {
    const sharedSecret = deriveSharedSecret(senderPrivateKey, recipientPublicKey);
    const iv = Buffer.alloc(16, 0);
    const cipher = createCipheriv('aes-256-gcm', sharedSecret.slice(0, 32), iv);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]);
}
export function decryptWithKey(recipientPrivateKey, senderPublicKey, ciphertext) {
    const sharedSecret = deriveSharedSecret(recipientPrivateKey, senderPublicKey);
    const iv = ciphertext.subarray(0, 16);
    const authTag = ciphertext.subarray(16, 32);
    const encrypted = ciphertext.subarray(32);
    const decipher = createDecipheriv('aes-256-gcm', sharedSecret.slice(0, 32), iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);
    return decrypted.toString('utf8');
}
export function encryptPayload(senderPrivateKey, recipientPublicKey, payload) {
    const plaintext = JSON.stringify(payload);
    const encrypted = encryptWithKey(senderPrivateKey, recipientPublicKey, plaintext);
    return encrypted.toString('base64');
}
export function decryptPayload(recipientPrivateKey, senderPublicKey, encryptedBase64) {
    const encrypted = Buffer.from(encryptedBase64, 'base64');
    const plaintext = decryptWithKey(recipientPrivateKey, senderPublicKey, encrypted);
    return JSON.parse(plaintext);
}
//# sourceMappingURL=ecdh.js.map