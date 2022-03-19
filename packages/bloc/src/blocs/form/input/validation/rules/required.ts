import { Rule } from '../rule'

export const IsRequired = new Rule<
  string | number | null | undefined | File,
  string
>({
  errorMessage: '{field} cannot be empty',
  validator: (value: string | null | number | undefined | File) => {
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
  },
})
