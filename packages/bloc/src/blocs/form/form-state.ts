import { Equatable } from '../../equatable'
import { Optional } from '../../optional'

export class FormState extends Equatable {
  readonly isValid: boolean
  readonly isLoading: boolean
  readonly isSubmitted: boolean

  constructor(payload: {
    isValid: boolean
    isSubmitted: boolean
    isLoading: boolean
  }) {
    super()
    this.isValid = payload.isValid
    this.isSubmitted = payload.isSubmitted
    this.isLoading = payload.isLoading
  }

  copyWith(payload: {
    isValid?: Optional<boolean>
    isSubmitted?: Optional<boolean>
    isLoading?: Optional<boolean>
  }) {
    return new FormState({
      isValid:
        payload.isValid && payload.isValid.isValid
          ? payload.isValid.value
          : this.isValid,
      isSubmitted:
        payload.isSubmitted && payload.isSubmitted.isValid
          ? payload.isSubmitted.value
          : this.isSubmitted,
      isLoading:
        payload.isLoading && payload.isLoading.isValid
          ? payload.isLoading.value
          : this.isLoading,
    })
  }

  get isNotValid(): boolean {
    return !this.isValid
  }

  get props(): unknown[] {
    return [this.isValid, this.isLoading, this.isSubmitted]
  }
}
