import { deepEqual } from '../../../../../util'
import { InputBloc } from '../../input-bloc'
import { Rule } from '../rule'


export const IsSame = <T>(bloc: InputBloc<T, any>) =>
  new Rule<T, string>({
    errorMessage: 'Invalid {field} value',
    validator: (value: T) => {
      return deepEqual(value, bloc.state.value)
    },
  })
