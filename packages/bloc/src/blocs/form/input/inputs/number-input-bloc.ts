import { InputBloc } from '../input-bloc'
import { Rule } from '../validation'

export class NumberInputBloc extends InputBloc<number, string> {
  constructor(payload: {
    name: string
    value?: number
    isRequired: false,
    rules?: Rule<number, string>[]
  }) {
    super({
      name: payload.name,
      value: payload.value ?? NaN,
      isRequired: payload.isRequired,
      rules: payload.rules ?? [],
    })
  }

  validateRequired(value: number): string | undefined {
    return value == NaN ? `${this.title} cannot be empty` : undefined
  }
}
