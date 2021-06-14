import { FormValidationException } from '../../exceptions/form-validation-exception'
import { FormStatus } from './form-state'

export abstract class FormEvent {}

export class StatusChanged extends FormEvent {
  readonly status: FormStatus
  constructor(status: FormStatus) {
    super()
    this.status = status
  }
}

export class FormSubmitted extends FormEvent {
  readonly status: FormStatus
  readonly resetForm: boolean

  constructor(status: FormStatus, resetForm: boolean = false) {
    super()
    this.status = status
    this.resetForm = resetForm
  }
}

export class ResetForm extends FormEvent {}

export class FormValidationError extends FormEvent {
  readonly error: FormValidationException

  constructor(error: FormValidationException) {
    super()
    this.error = error
  }
}
