import { Rule } from './rule'
export const validate = <T, E>(
  value: T,
  name: string,
  rules: Rule<T, E>[]
): E | undefined => {
  for (const rule of rules) {
    const error = rule.validate(value, name)
    if (error) {
      return error
    }
  }
}
