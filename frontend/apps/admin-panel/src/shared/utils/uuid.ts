/**
 * Generates a random UUID v4
 * This is a cross-browser compatible alternative to crypto.randomUUID()
 */
export function generateUUID(): string {
  // Check if crypto.randomUUID is available (modern browsers in secure contexts)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Fallback for older browsers or insecure contexts
  // Generate a UUID v4 using random bytes
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
