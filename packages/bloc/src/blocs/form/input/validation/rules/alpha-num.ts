import { Rule } from '../rule'

export const IsAlphaNum = () =>
  new Rule<string, string>({
    errorMessage: 'The {field} must be alphanumeric',
    validator: (value: string) => {
      return /^[A-Za-z0-9]+$/.test(value)
    },
  })
