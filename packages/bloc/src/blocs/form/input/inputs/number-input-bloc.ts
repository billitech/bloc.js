import { InputBloc } from '../input-bloc'
import { Rule } from '../validation'

export class NumberInputBloc extends InputBloc<number, string> {

  constructor(payload: {
    name: string
    value?: number
    rules?: Rule<number, string>[]
  }) {
    super({
      name: payload.name,
      value: payload.value ?? NaN,
      rules: payload.rules ?? [],
    })
  }
}