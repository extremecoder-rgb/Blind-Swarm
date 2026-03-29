import crypto from 'crypto';
import { canonicalStringify } from './deterministic.js';

export function sha256(data: string | Buffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

export function sha256Batch(items: string[]): string[] {
  return items.map(sha256);
}

export function hashObject(obj: any): string {
  const canonical = canonicalStringify(obj);
  return sha256(canonical);
}
