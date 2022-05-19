import { FormValidationException } from '../../../exceptions'
import { Equatable } from '../../../equatable'

export enum FormHandlerStatus {
  initial,
  loading,
  failure,
  success,
}

export class FormHandlerState<R> extends Equatable {
  readonly status: FormHandlerStatus
  readonly successData?: R
  readonly error?: string
  readonly validationError?: FormValidationException

  constructor(payload: {
    status: FormHandlerStatus
    successData?: R
    error?: string
    validationError?: FormValidationException
  }) {
    super()
    this.status = payload.status
    this.successData = payload.successData
    this.error = payload.error
    this.validationError = payload.validationError
  }

  copyWith(payload: {
    status: FormHandlerStatus
    successData?: R | null
    error?: string | null
    validationError?: FormValidationException | null
  }): FormHandlerState<R> {
    return new FormHandlerState<R>({
      status: payload.status ?? this.status,
      successData:
        payload.successData === null
          ? undefined
          : payload.successData ?? this.successData,
      error: payload.error === null ? undefined : payload.error ?? this.error,
      validationError:
        payload.validationError === null
          ? undefined
          : payload.validationError ?? this.validationError,
    })
  }

  get isInitial(): boolean {
    return this.status === FormHandlerStatus.initial
  }

  get isLoading(): boolean {
    return this.status === FormHandlerStatus.loading
  }

  get isSuccess(): boolean {
    return (
      this.status == FormHandlerStatus.success && this.successData !== undefined
    )
  }

  get isFailure(): boolean {
    return this.status == FormHandlerStatus.failure && this.error !== undefined
  }

  get isValidationFailure(): boolean {
    return (
      this.status == FormHandlerStatus.failure && this.validationError != null
    )
  }

  get props(): any[] {
    return [this.status, this.successData, this.error, this.validationError]
  }
}
