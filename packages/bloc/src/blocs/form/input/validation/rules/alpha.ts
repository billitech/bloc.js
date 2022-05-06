import { Rule } from '../rule'

export const IsAlpha = () =>
  new Rule<string, string>({
    errorMessage: '{field} field should be alphabetical',
    validator: (value: string) => {
      return /^[a-zA-Z]*$/.test(value)
    },
  })
