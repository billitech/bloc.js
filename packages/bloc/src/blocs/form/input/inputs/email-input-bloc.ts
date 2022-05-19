import { Rule } from '../validation'
import { StringInputBloc } from './string-input-bloc'
import { IsEmail } from '../validation/rules'

export class EmailInputBloc extends StringInputBloc {
  constructor(payload: {
    name: string
    value?: string
    isRequired: false,
    rules?: Rule<string, string>[]
  }) {
    super(payload)
    this.validationRules.push(IsEmail)
  }
}