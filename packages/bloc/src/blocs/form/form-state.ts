import { ApiResponse } from '../../api'
import { Equatable } from '../../equatable'
import { Optional } from '../../optional'

export class FormState<R> extends Equatable {
  readonly isValid: boolean
  readonly isLoading: boolean
  readonly response?: ApiResponse<R>

  constructor({
    isValid = false,
    isLoading = false,
    response,
  }: {
    isValid: boolean
    isLoading: boolean
    response?: ApiResponse<R>
  }) {
    super()
    this.isValid = isValid
    this.isLoading = isLoading
    this.response = response
  }

  copyWith({
    isValid,
    isLoading,
    response,
  }: {
    isValid?: Optional<boolean>
    isLoading?: Optional<boolean>
    response?: Optional<ApiResponse<R> | undefined>
  }) {
    return new FormState({
      isValid: isValid && isValid.isValid ? isValid.value : this.isValid,
      isLoading:
        isLoading && isLoading.isValid ? isLoading.value : this.isLoading,
      response: response && response.isValid ? response.value : this.response,
    })
  }

  get isNotValid(): boolean {
    return !this.isValid
  }

  get props(): unknown[] {
    return [this.isValid, this.isLoading, this.response]
  }
}
