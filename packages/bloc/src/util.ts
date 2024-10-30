export const validateRequired = (
  value: string | null | number | undefined | File,
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
      return error.message?.toString() ?? 'An error occurred'
    } else if (
      error !== null &&
      'data' in error &&
      error.data &&
      typeof error.data == 'object' &&
      'message' in error.data
    ) {
      return error.data.message?.toString() ?? 'An error occurred'
    } else if (
      error !== null &&
      'response' in error &&
      error.response &&
      typeof error.response == 'object' &&
      'message' in error.response
    ) {
      return error.response.message?.toString() ?? 'An error occurred'
    } else if (
      error !== null &&
      'data' in error &&
      error.data &&
      typeof error.data == 'object' &&
      'response' in error.data &&
      error.data.response &&
      typeof error.data.response == 'object' &&
      'message' in error.data.response
    ) {
      return error.data.response.message?.toString() ?? 'An error occurred'
    } else if (
      error !== null &&
      'response' in error &&
      error.response &&
      typeof error.response == 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data == 'object' &&
      'message' in error.response.data
    ) {
      return error.response.data.message?.toString() ?? 'An error occurred'
    } else if (error !== null && 'error' in error) {
      return error.error?.toString() ?? 'An error occurred'
    }
  }

  return error?.toString() ?? ''
}

export const getErrorResponseCode = (error: unknown) => {
  if (typeof error == 'object') {
    if (error !== null && 'responseCode' in error) {
      return error.responseCode?.toString()
    } else if (
      error !== null &&
      'data' in error &&
      error.data &&
      typeof error.data == 'object' &&
      'responseCode' in error.data
    ) {
      return error.data.responseCode?.toString()
    } else if (
      error !== null &&
      'response' in error &&
      error.response &&
      typeof error.response == 'object' &&
      'responseCode' in error.response
    ) {
      return error.response.responseCode?.toString()
    } else if (
      error !== null &&
      'data' in error &&
      error.data &&
      typeof error.data == 'object' &&
      'response' in error.data &&
      error.data.response &&
      typeof error.data.response == 'object' &&
      'responseCode' in error.data.response
    ) {
      return error.data.response.responseCode?.toString()
    } else if (
      error !== null &&
      'response' in error &&
      error.response &&
      typeof error.response == 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data == 'object' &&
      'responseCode' in error.response.data
    ) {
      return error.response.data.responseCode?.toString()
    }
  }
}

export const getErrorStatusCode = (error: unknown) => {
  if (typeof error == 'object') {
    if (error !== null && 'statusCode' in error) {
      return error.statusCode?.toString()
    } else if (
      error !== null &&
      'data' in error &&
      error.data &&
      typeof error.data == 'object' &&
      'statusCode' in error.data
    ) {
      return error.data.statusCode?.toString()
    } else if (
      error !== null &&
      'response' in error &&
      error.response &&
      typeof error.response == 'object' &&
      'statusCode' in error.response
    ) {
      return error.response.statusCode?.toString()
    } else if (
      error !== null &&
      'data' in error &&
      error.data &&
      typeof error.data == 'object' &&
      'response' in error.data &&
      error.data.response &&
      typeof error.data.response == 'object' &&
      'statusCode' in error.data.response
    ) {
      return error.data.response.statusCode?.toString()
    } else if (
      error !== null &&
      'response' in error &&
      error.response &&
      typeof error.response == 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data == 'object' &&
      'statusCode' in error.response.data
    ) {
      return error.response.data.statusCode?.toString()
    }
  }
}

export const getErrorErrors = (error: unknown) => {
  const errorsObject = getErrorErrorsObject(error)
  if (!errorsObject) {
    return null
  }

  const errors: Record<string, string> = {}
  for (const key in errorsObject) {
    if (errorsObject[key] && typeof errorsObject[key] == 'string') {
      errors[key] = errorsObject[key] ?? ''
    } else if (
      errorsObject[key] &&
      typeof errorsObject[key] == 'object' &&
      Array.isArray(errorsObject[key])
    ) {
      errors[key] = errorsObject[key][0]?.toString() ?? ''
    } else if (errorsObject[key] && typeof errorsObject[key] == 'object') {
      errors[key] = errorsObject[key]?.toString() ?? ''
    }
  }

  return errors
}

function getErrorErrorsObject(error: unknown) {
  if (typeof error == 'object') {
    if (
      error !== null &&
      'errors' in error &&
      typeof error.errors == 'object'
    ) {
      return error.errors
    } else if (
      error !== null &&
      'data' in error &&
      error.data &&
      typeof error.data == 'object' &&
      'errors' in error.data &&
      typeof error.data.errors == 'object'
    ) {
      return error.data.errors
    } else if (
      error !== null &&
      'response' in error &&
      error.response &&
      typeof error.response == 'object' &&
      'errors' in error.response &&
      typeof error.response.errors == 'object'
    ) {
      return error.response.errors
    } else if (
      error !== null &&
      'data' in error &&
      error.data &&
      typeof error.data == 'object' &&
      'response' in error.data &&
      error.data.response &&
      typeof error.data.response == 'object' &&
      'errors' in error.data.response &&
      typeof error.data.response.errors == 'object'
    ) {
      return error.data.response.errors
    } else if (
      error !== null &&
      'response' in error &&
      error.response &&
      typeof error.response == 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data == 'object' &&
      'errors' in error.response.data &&
      typeof error.response.data.errors == 'object'
    ) {
      return error.response.data.errors
    }
  }

  return null
}
