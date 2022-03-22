export const validateRequired = (
  value: string | null | number | undefined | File
) => {
  if (value == null || value == undefined) {
    return false
  }
  if (typeof value == 'string') {
    return value.length > 0
  }
  if (typeof value == 'number') {
    return !isNaN(value)
  }

  if (value instanceof File) {
    return value.name.length < 1
  }
  return true
}

export const toTitleCase = (value: string) =>
  value
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase()) // Initial char (after -/_)
    .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase())
