export * from './deterministic.js';
export * from './hash.js';
export * from './signature.js';
export * from './ecdh.js';
import { canonicalStringify } from './deterministic.js';
import { sha256, sha256Batch, hashObject } from './hash.js';
import { verifySignature, verifyMidnightSignature, signMessage, generateKeypair, hexToUint8Array, uint8ArrayToHex, } from './signature.js';
import { generateECDHKeyPair, deriveSharedSecret, encryptWithKey, decryptWithKey, encryptPayload, decryptPayload, } from './ecdh.js';
export const crypto = {
    canonicalStringify,
    sha256,
    sha256Batch,
    hashObject,
    verifySignature,
    verifyMidnightSignature,
    signMessage,
    generateKeypair,
    generateKeyPair: generateKeypair,
    hexToUint8Array,
    uint8ArrayToHex,
    generateECDHKeyPair,
    deriveSharedSecret,
    encryptWithKey,
    decryptWithKey,
    encryptPayload,
    decryptPayload,
};
export default {
    canonicalStringify,
    sha256,
    sha256Batch,
    hashObject,
    verifySignature,
    verifyMidnightSignature,
    signMessage,
    generateKeypair,
    hexToUint8Array,
    uint8ArrayToHex,
    generateECDHKeyPair,
    deriveSharedSecret,
    encryptWithKey,
    decryptWithKey,
    encryptPayload,
    decryptPayload,
};
//# sourceMappingURL=index.js.map