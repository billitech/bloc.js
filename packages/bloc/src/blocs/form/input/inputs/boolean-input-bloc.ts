import { InputBloc } from '../input-bloc'
import { Rule } from '../validation'

export class BooleanInputBloc extends InputBloc<boolean, string> {
  constructor(payload: {
    name: string
    value?: boolean
    rules?: Rule<boolean, string>[]
  }) {
    super({
      name: payload.name,
      value: payload.value ?? false,
      rules: payload.rules ?? [],
    })
  }
}
