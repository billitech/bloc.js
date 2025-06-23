import { ApiResponse } from '../../api'
import { Equatable } from '../../equatable'
import { Optional } from '../../optional'

export class FormState<R> extends Equatable {
  readonly isValid: boolean
  readonly isValidating: boolean
  readonly isLoading: boolean
  readonly response?: ApiResponse<R>

  constructor({
    isValid = false,
    isValidating = false,
    isLoading = false,
    response,
  }: {
    isValid: boolean
    isValidating: boolean
    isLoading: boolean
    response?: ApiResponse<R>
  }) {
    super()
    this.isValid = isValid
    this.isValidating = isValid
    this.isLoading = isLoading
    this.response = response
  }

  copyWith({
    isValid,
    isValidating,
    isLoading,
    response,
  }: {
    isValid?: Optional<boolean>
    isValidating?: Optional<boolean>
    isLoading?: Optional<boolean>
    response?: Optional<ApiResponse<R> | undefined>
  }) {
    return new FormState({
      isValid: isValid && isValid.isValid ? isValid.value : this.isValid,
      isValidating:
        isValidating && isValidating.isValid
          ? isValidating.value
          : this.isValidating,
      isLoading:
        isLoading && isLoading.isValid ? isLoading.value : this.isLoading,
      response: response && response.isValid ? response.value : this.response,
    })
  }

  get isNotValid(): boolean {
    return !this.isValid
  }

  get isNotValidating(): boolean {
    return !this.isValidating
  }

  get canSubmit(): boolean {
    return this.isValid && this.isNotValidating
  }

  get props(): unknown[] {
    return [this.isValid, this.isLoading, this.response]
  }
}
