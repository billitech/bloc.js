import { Rule } from '../validation'
import { StringInputBloc } from './string-input-bloc'
import { IsEmail } from '../validation/rules'

export class EmailInputBloc<T extends string = string> extends StringInputBloc<T> {
  constructor(payload: {
    name: string
    value?: T
    isRequired?: boolean,
    rules?: Rule<string, string>[]
  }) {
    super(payload)
    this.validationRules.push(IsEmail)
  }
}