/**
 * Verifies a standard Ed25519 signature
 */
export declare function verifySignature(publicKeyHex: string, message: string, signatureHex: string): Promise<boolean>;
/**
 * Verifies a signature specifically using the Midnight network's curve/format
 * In this production implementation, we use Ed25519 as the primary cryptographic primitive
 * for the multi-agent attestations.
 */
export declare function verifyMidnightSignature(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): Promise<boolean>;
/**
 * Sign a message using a private key
 */
export declare function signMessage(privateKeyHex: string, message: string): Promise<string>;
/**
 * Generate a new random keypair
 */
export declare function generateKeypair(): Promise<{
    publicKey: string;
    privateKey: string;
}>;
export declare function hexToUint8Array(hex: string): Uint8Array;
export declare function uint8ArrayToHex(arr: Uint8Array): string;
//# sourceMappingURL=signature.d.ts.map