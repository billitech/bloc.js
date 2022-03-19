import { Rule } from '../rule'

export const IsLength = (min: number, max: number) =>
  new Rule<string | number, string>({
    errorMessage: 'The {field} length must be between {min} and {max}',
    errorFormatter: (field, errorMessage) =>
      errorMessage
        .replaceAll('{field}', field)
        .replaceAll('{min}', min.toString())
        .replaceAll('{max}', max.toString()),
    validator: (value: string | number) => {
      if (typeof value == 'number') {
        value = value.toString()
      }

      return value.length >= min && value.length <= max
    },
  })
