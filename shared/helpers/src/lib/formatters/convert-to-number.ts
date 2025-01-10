export function tryConvertToNumber<T>(originalValue: T): T | number {
  const converted = Number(originalValue);
  if (isNaN(converted)) {
    return originalValue;
  }
  return converted;
}
