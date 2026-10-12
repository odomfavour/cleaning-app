// Older request links used MongoDB IDs; newer links use public references.
export function requestLookup(identifier: string) {
  const value = identifier.trim();
  return /^[a-f0-9]{24}$/i.test(value)
    ? { $or: [{ reference: value }, { _id: value }] }
    : { reference: value };
}
