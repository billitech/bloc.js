import { Rule } from '../rule'

export const IsNumeric = () =>
  new Rule<string, string>({
    errorMessage: 'The {field} must be numeric',
    validator: (value: string) => {
      return /^-?\d+$/.test(value)
    },
  })
