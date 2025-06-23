import { ApiResponse } from '../../api'
import { FormValidationException } from '../../exceptions/form-validation-exception'

export abstract class FormEvent {}

export class FormValidChanged extends FormEvent {
  readonly isValid: boolean
  readonly isValidating: boolean
  constructor(isValid: boolean, isValidating: boolean) {
    super()
    this.isValid = isValid
    this.isValidating = isValidating
  }
}

export class FormLoadingChanged extends FormEvent {
  readonly loading: boolean
  constructor(loading: boolean) {
    super()
    this.loading = loading
  }
}

export class FormSubmitted extends FormEvent {
  readonly response: ApiResponse<any>
  readonly resetForm: boolean

  constructor(payload: { response: ApiResponse<any>; resetForm?: boolean }) {
    super()
    this.response = payload.response
    this.resetForm = payload.resetForm ?? false
  }
}

export class ValidateForm extends FormEvent {}

export class ResetForm extends FormEvent {}

export class FormValidationError extends FormEvent {
  readonly error: FormValidationException

  constructor(error: FormValidationException) {
    super()
    this.error = error
  }
}
