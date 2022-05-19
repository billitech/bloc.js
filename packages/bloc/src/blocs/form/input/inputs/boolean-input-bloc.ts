import { InputBloc } from '../input-bloc'
import { Rule } from '../validation'

export class BooleanInputBloc extends InputBloc<boolean, string> {
  constructor(payload: {
    name: string
    value?: boolean
    isRequired: false
    rules?: Rule<boolean, string>[]
  }) {
    super({
      name: payload.name,
      value: payload.value ?? false,
      isRequired: payload.isRequired,
      rules: payload.rules ?? [],
    })
  }

  validateRequired(value: boolean): string | undefined {
    return undefined
  }
}
