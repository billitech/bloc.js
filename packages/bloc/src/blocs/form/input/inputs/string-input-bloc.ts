import { InputBloc } from '../input-bloc'
import { Rule, validate } from '../validation'

export class StringInputBloc extends InputBloc<string, string> {
  constructor(payload: {
    name: string
    value?: string
    rules?: Rule<string, string>[]
  }) {
    super({
      name: payload.name,
      value: payload.value ?? '',
      rules: payload.rules ?? [],
    })
  }
}
