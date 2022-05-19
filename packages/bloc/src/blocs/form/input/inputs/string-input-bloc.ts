import { InputBloc } from '../input-bloc'
import { Rule } from '../validation'

export class StringInputBloc extends InputBloc<string, string> {
  constructor(payload: {
    name: string
    value?: string
    isRequired?: boolean,
    rules?: Rule<string, string>[]
  }) {
    super({
      name: payload.name,
      value: payload.value ?? '',
      isRequired: payload.isRequired,
      rules: payload.rules ?? [],
    })
  }

  validateRequired(value: string): string | undefined {
    return value.length < 1 ? `${this.title} cannot be empty` : undefined
  }
}
