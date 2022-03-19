import { validateRequired } from '../../../../../util'
import { InputBloc } from '../../input-bloc'
import { Rule } from '../rule'

export const IsRequiredIf = (
  bloc: InputBloc<string | number | null | undefined | File, unknown>
) =>
  new Rule<string | number | null | undefined | File, string>({
    errorMessage: '{field} cannot be empty',
    validator: (value: string | number | null | undefined | File) => {
      if (validateRequired(bloc.state.value)) {
        return validateRequired(value)
      }

      return true
    },
  })
