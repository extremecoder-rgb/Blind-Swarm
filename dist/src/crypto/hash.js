import crypto from 'crypto';
import { canonicalStringify } from './deterministic.js';
export function sha256(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}
export function sha256Batch(items) {
    return items.map(sha256);
}
export function hashObject(obj) {
    const canonical = canonicalStringify(obj);
    return sha256(canonical);
}
//# sourceMappingURL=hash.js.map