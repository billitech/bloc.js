import { Rule } from '../rule'

export const IsNumeric = () =>
  new Rule<string, string>({
    errorMessage: '{field} field should be numeric',
    validator: (value: string) => {
      return /^-?\d+$/.test(value)
    },
  })
