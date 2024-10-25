import { InputBloc } from '../input-bloc'
import { Rule } from '../validation'

export class NullableObjectInputBloc<T> extends InputBloc<T | null, string> {
  constructor(payload: {
    name: string
    value?: T | null
    isRequired?: boolean
    rules?: Rule<T | null, string>[]
  }) {
    super({
      name: payload.name,
      value: payload.value ?? null,
      isRequired: payload.isRequired,
      rules: payload.rules ?? [],
    })
  }
  validateRequired(value: T | null): string | undefined {
    return !value ? `${this.title} is required` : undefined
  }
}
