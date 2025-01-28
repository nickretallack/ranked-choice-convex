/**
 * Trims leading/trailing whitespace and normalizes internal spaces to a single space
 */
export function normalizeWhitespace(text: string): string {
  return text.trim().replace(/\s+/g, " ").normalize();
}

export function trimList(list: string[]) {
  return list.map((item) => normalizeWhitespace(item)).filter(Boolean);
}
