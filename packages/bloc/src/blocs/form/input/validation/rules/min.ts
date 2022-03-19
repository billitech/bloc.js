import { Rule } from '../rule'

export const IsMin = (min: number) =>
  new Rule<string | number, string>({
    errorMessage: 'The {field} must be minimum of {min}',
    errorFormatter: (field, errorMessage) =>
      errorMessage
        .replaceAll('{field}', field)
        .replaceAll('{min}', min.toString()),

    validator: (value: string | number) => {
      if (typeof value == 'number') {
        return value >= min
      }

      return value.length >= min
    },
  })
