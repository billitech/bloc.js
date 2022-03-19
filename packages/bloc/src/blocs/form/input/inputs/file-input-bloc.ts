import { InputBloc } from '../input-bloc'
import { Rule } from '../validation'

export class FileInputBloc extends InputBloc<File, string> {
  constructor(payload: {
    name: string
    value?: File
    rules?: Rule<File, string>[]
  }) {
    super({
      name: payload.name,
      value: payload.value ?? new File([''], ''),
      rules: payload.rules ?? [],
    })
  }
}