import { Rule } from '../rule'

export const IsMax = (max: number) =>
  new Rule<string | number, string>({
    errorMessage: 'The {field} must be maximum of {max}',
    errorFormatter: (field, errorMessage) =>
      errorMessage
        .replaceAll('{field}', field)
        .replaceAll('{max}', max.toString()),
    validator: (value: string | number) => {
      if (typeof value == 'number') {
        return value <= max
      }

      return value.length <= max
    },
  })
