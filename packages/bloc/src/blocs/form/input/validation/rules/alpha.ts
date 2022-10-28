import { Rule } from '../rule'

export const IsAlpha = new Rule<string, string>({
  errorMessage: 'The {field} must be alphabetical',
  validator: (value: string) => {
    return /^[a-zA-Z]*$/.test(value)
  },
})
