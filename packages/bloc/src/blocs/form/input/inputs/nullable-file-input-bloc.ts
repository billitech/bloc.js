import { InputBloc } from '../input-bloc'
import { Rule } from '../validation'

export class NullableFileInputBloc extends InputBloc<File | null, string> {
  constructor(payload: {
    name: string
    value?: File
    isRequired?: boolean
    rules?: Rule<File | null, string>[]
  }) {
    super({
      name: payload.name,
      value: payload.value ?? new File([''], ''),
      isRequired: payload.isRequired,
      rules: payload.rules ?? [],
    })
  }

  validateRequired(value: File | null): string | undefined {
    return !value || value.size < 1
      ? `${this.title} cannot be empty`
      : undefined
  }
}
