import { Rule } from '../rule'

export const MatchRegex = (regexp: RegExp) =>
  new Rule<string, string>({
    errorMessage: 'Invalid {field} value',
    validator: (value: string) => {
      return regexp.test(value)
    },
  })
