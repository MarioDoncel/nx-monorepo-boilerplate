export const formatDateToYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0]
}