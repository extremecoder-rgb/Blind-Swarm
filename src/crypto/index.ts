export * from './deterministic.js';
export * from './hash.js';
export * from './signature.js';

import { canonicalStringify } from './deterministic.js';
import { sha256, sha256Batch, hashObject } from './hash.js';
import { verifySignature, verifyMidnightSignature } from './signature.js';

export const crypto = {
  canonicalStringify,
  sha256,
  sha256Batch,
  hashObject,
  verifySignature,
  verifyMidnightSignature,
};

export default {
  canonicalStringify,
  sha256,
  sha256Batch,
  hashObject,
  verifySignature,
  verifyMidnightSignature,
};
