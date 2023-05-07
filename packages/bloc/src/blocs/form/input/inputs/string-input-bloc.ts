import { InputBloc } from '../input-bloc'
import { Rule } from '../validation'

export class StringInputBloc<T extends string = string> extends InputBloc<
  T | "",
  string
> {
  constructor(payload: {
    name: string
    value?: T
    isRequired?: boolean
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
