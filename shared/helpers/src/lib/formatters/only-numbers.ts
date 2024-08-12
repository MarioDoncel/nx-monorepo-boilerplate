export function formatToOnlyNumbers(data: string): string {
  return `${data}`.replace(/\D+/g, '');
}
