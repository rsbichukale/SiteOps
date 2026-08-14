/**
 * Generates a positive 31-bit identifier that is safe for legacy PostgreSQL
 * INTEGER columns. The random source avoids timestamp overflow and makes
 * collisions across browser sessions substantially less likely.
 */
export function createLocalId(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return (values[0] & 0x7fffffff) || 1;
  }

  return Math.floor(Math.random() * 0x7ffffffe) + 1;
}
