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
    return value.name.length > 0 && value.size > 0
  }
  return true
}

export const toTitleCase = (value: string) =>
  value
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase()) // Initial char (after -/_)
    .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase())

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const getErrorMessage = (error: unknown) => {
  if (typeof error == 'object') {
    if (error !== null && 'message' in error) {
      return (error as { message: string }).message ?? 'An error occurred'
    } else if (error !== null && 'error' in error) {
      return (error as { error: string }).error ?? 'An error occurred'
    } else {
      return error?.toString() ?? 'An error occurred'
    }
  } else {
    return error as string
  }
}
