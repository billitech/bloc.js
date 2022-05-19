import { InputBloc } from '../input-bloc'
import { Rule } from '../validation'

export class FileInputBloc extends InputBloc<File, string> {
  constructor(payload: {
    name: string
    value?: File
    isRequired?: boolean,
    rules?: Rule<File, string>[]
  }) {
    super({
      name: payload.name,
      value: payload.value ?? new File([''], ''),
      isRequired: payload.isRequired,
      rules: payload.rules ?? [],
    })
  }

  validateRequired(value: File): string | undefined {
    return value.size < 1 ? `${this.title} cannot be empty` : undefined
  }
}
