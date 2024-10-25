import { InputBloc } from '../input-bloc'
import { Rule } from '../validation'

export class ObjectInputBloc<T> extends InputBloc<T, string> {
  constructor(payload: {
    name: string
    value: T
    isRequired?: boolean
    rules?: Rule<T | null, string>[]
  }) {
    super({
      name: payload.name,
      value: payload.value,
      isRequired: payload.isRequired,
      rules: payload.rules ?? [],
    })
  }
  validateRequired(value: T | null): string | undefined {
    return !value ? `${this.title} is required` : undefined
  }
}
