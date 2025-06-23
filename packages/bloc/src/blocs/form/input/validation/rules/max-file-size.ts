import { formatBytes } from '../../../../../util'
import { Rule } from '../rule'

export const IsMaxFileSize = (max: number) =>
  new Rule<File | null, string>({
    errorMessage: 'The {field} must be maximum size of {max}',
    errorFormatter: (field, errorMessage) =>
      errorMessage
        .replaceAll('{field}', field)
        .replaceAll('{max}', formatBytes(max)),
    validator: (value: File | null) => {
      return !!value && value.size <= max
    },
  })
