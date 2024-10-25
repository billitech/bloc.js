import { InputBloc } from '../input-bloc'
import { Rule } from '../validation'

export class DateInputBloc extends InputBloc<Date, string> {
  constructor(payload: {
    name: string
    value?: Date | null
    isRequired?: boolean
    rules?: Rule<Date, string>[]
  }) {
    super({
      name: payload.name,
      value: payload.value ?? new Date(0),
      isRequired: payload.isRequired,
      rules: payload.rules ?? [],
    })
  }
  validateRequired(value: Date): string | undefined {
    return value.getTime() < 1 ? `${this.title} is required` : undefined
  }
}
