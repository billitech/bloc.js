import { validateRequired } from '../../../../../util'
import { Rule } from '../rule'

export const IsRequired = new Rule<
  string | number | null | undefined | File,
  string
>({
  errorMessage: '{field} cannot be empty',
  validator: validateRequired,
})
