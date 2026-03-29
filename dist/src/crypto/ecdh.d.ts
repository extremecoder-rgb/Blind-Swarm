export interface KeyPair {
    publicKey: Buffer;
    privateKey: Buffer;
}
export declare function generateECDHKeyPair(): KeyPair;
export declare function deriveSharedSecret(privateKey: Buffer, publicKey: Buffer): Buffer;
export declare function encryptWithKey(senderPrivateKey: Buffer, recipientPublicKey: Buffer, plaintext: string): Buffer;
export declare function decryptWithKey(recipientPrivateKey: Buffer, senderPublicKey: Buffer, ciphertext: Buffer): string;
export declare function encryptPayload(senderPrivateKey: Buffer, recipientPublicKey: Buffer, payload: object): string;
export declare function decryptPayload(recipientPrivateKey: Buffer, senderPublicKey: Buffer, encryptedBase64: string): object;
//# sourceMappingURL=ecdh.d.ts.map