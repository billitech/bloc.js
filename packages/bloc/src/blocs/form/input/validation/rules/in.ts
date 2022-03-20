import { Rule } from '../rule'
import { deepEqual } from '../../../../../util'

export function IsIn(...stack: unknown[]) {
  return new Rule<string | number, string>({
    errorMessage: 'The {field} is invalid',
    validator: (value: string | number) => {
      for (const value2 of stack) {
        if (deepEqual(value, value2)) {
          return true
        }
      }

      return false
    },
  })
}
