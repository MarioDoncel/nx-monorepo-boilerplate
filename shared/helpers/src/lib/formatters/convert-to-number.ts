export function tryConvertToNumber<T extends unknown>(
  originalValue: T,
): T | number {
  const converted = Number(originalValue)
  if (isNaN(converted)) {
    return originalValue
  }
  return converted
}
