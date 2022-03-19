export const deepEqual = function (x: unknown, y: unknown) {
  if (x === y) {
    return true
  } else if (
    typeof x == 'object' &&
    x != null &&
    typeof y == 'object' &&
    y != null
  ) {
    if (Object.keys(x).length != Object.keys(y).length) return false

    for (var prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop])) return false
      } else return false
    }

    return true
  } else return false
}

export const validateRequired = (value: string | null | number | undefined | File) => {
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
