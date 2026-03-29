import crypto from 'crypto';

export function canonicalStringify(obj: any): string {
  if (obj === null || obj === undefined) {
    return 'null';
  }
  
  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return `"${obj}"`;
    }
    return String(obj);
  }
  
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }
  
  const keys = Object.keys(obj).sort();
  const pairs = keys.map((key) => `"${key}":${canonicalStringify(obj[key])}`);
  return '{' + pairs.join(',') + '}';
}
