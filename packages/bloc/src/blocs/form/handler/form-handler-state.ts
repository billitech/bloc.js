import { ApiResponse } from '../../../api'
import { Optional } from '../../../optional'

export enum FormHandlerStatus {
  Initial = 'initial',
  Loading = 'loading',
  Failure = 'failure',
  Success = 'success',
}

export class FormHandlerState<R> {
  readonly isLoading: boolean
  readonly response?: ApiResponse<R> & { __formId: string }

  constructor({
    isLoading = false,
    response,
  }: {
    isLoading?: boolean
    response?: ApiResponse<R> & { __formId: string }
  } = {}) {
    this.isLoading = isLoading
    this.response = response
  }

  copyWith({
    isLoading,
    response,
  }: {
    isLoading?: Optional<boolean>
    response?: Optional<(ApiResponse<R> & { __formId: string }) | undefined>
  }): FormHandlerState<R> {
    return new FormHandlerState<R>({
      isLoading:
        isLoading && isLoading.isValid ? isLoading.value : this.isLoading,
      response: response && response.isValid ? response.value : this.response,
    })
  }

  get isInitial(): boolean {
    return this.response === undefined && !this.isLoading
  }

  get isSuccess(): boolean {
    return (
      this.response !== undefined &&
      !this.isLoading &&
      this.response?.status === true
    )
  }

  get isFailure(): boolean {
    return (
      this.response !== undefined &&
      !this.isLoading &&
      this.response?.status !== true
    )
  }

  get isValidationFailure(): boolean {
    return (
      this.isFailure &&
      this.response?.errors !== undefined &&
      Object.keys(this.response.errors ?? {}).length > 0
    )
  }

  get status(): FormHandlerStatus {
    if (this.isLoading) {
      return FormHandlerStatus.Loading
    }
    if (this.isSuccess) {
      return FormHandlerStatus.Success
    }
    if (this.isFailure) {
      return FormHandlerStatus.Failure
    }
    return FormHandlerStatus.Initial
  }

  get props(): any[] {
    return [this.isLoading, this.response]
  }
}
